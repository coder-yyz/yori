package service

import (
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"backend/internal/model"
	"backend/internal/repository"
)

// 照片墙允许的 MIME 类型（图片 + RAW）
var photoAllowedMIME = map[string]bool{
	// 常见图片
	"image/jpeg":    true,
	"image/png":     true,
	"image/gif":     true,
	"image/webp":    true,
	"image/svg+xml": true,
	"image/tiff":    true,
	"image/bmp":     true,
	"image/heic":    true,
	"image/heif":    true,
	"image/avif":    true,
	// 相机 RAW（通常为 application/octet-stream，按扩展名判断）
}

// RAW 扩展名白名单
var rawExtensions = map[string]bool{
	".cr2": true, ".cr3": true, // Canon
	".nef": true, ".nrw": true, // Nikon
	".arw": true, // Sony
	".orf": true, // Olympus
	".rw2": true, // Panasonic
	".raf": true, // Fujifilm
	".dng": true, // Adobe DNG
	".pef": true, // Pentax
	".srw": true, // Samsung
	".raw": true,
}

const photoMaxFileSize = 50 << 20 // 50 MB

var photoUploadDir = filepath.Join("uploads", "photos")

// UploadPhoto 上传照片并创建记录
func UploadPhoto(userID uint, fh *multipart.FileHeader, req *model.CreatePhotoReq) (*model.Photo, error) {
	if fh.Size > photoMaxFileSize {
		return nil, fmt.Errorf("文件大小不能超过 50MB，当前: %.2f MB", float64(fh.Size)/(1<<20))
	}

	mimeType := strings.ToLower(strings.Split(fh.Header.Get("Content-Type"), ";")[0])
	ext := strings.ToLower(filepath.Ext(fh.Filename))

	// 校验：MIME 白名单 或 RAW 扩展名
	if !photoAllowedMIME[mimeType] && !rawExtensions[ext] {
		return nil, errors.New("不支持的文件类型，仅支持图片和相机 RAW 格式")
	}

	if err := os.MkdirAll(photoUploadDir, 0750); err != nil {
		return nil, errors.New("创建上传目录失败")
	}

	storeName := model.NewPublicUUID() + ext
	dst := filepath.Join(photoUploadDir, storeName)

	// 路径遍历防护
	absUpload, _ := filepath.Abs(photoUploadDir)
	absDst, _ := filepath.Abs(dst)
	if !strings.HasPrefix(absDst, absUpload+string(filepath.Separator)) {
		return nil, errors.New("非法文件路径")
	}

	src, err := fh.Open()
	if err != nil {
		return nil, errors.New("无法读取上传文件")
	}
	defer src.Close()

	tmpPath := dst + ".tmp"
	out, err := os.OpenFile(tmpPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0640)
	if err != nil {
		return nil, errors.New("创建文件失败")
	}

	buf := make([]byte, 32*1024)
	written := int64(0)
	for {
		n, readErr := src.Read(buf)
		if n > 0 {
			if _, wErr := out.Write(buf[:n]); wErr != nil {
				out.Close()
				os.Remove(tmpPath)
				return nil, errors.New("写入文件失败")
			}
			written += int64(n)
			if written > photoMaxFileSize {
				out.Close()
				os.Remove(tmpPath)
				return nil, errors.New("文件超出大小限制")
			}
		}
		if readErr != nil {
			break
		}
	}
	out.Close()

	if err := os.Rename(tmpPath, dst); err != nil {
		os.Remove(tmpPath)
		return nil, errors.New("保存文件失败")
	}

	url := fmt.Sprintf("/uploads/photos/%s", storeName)

	// 解析标签 UUID → 内部 ID
	var tagIDs []uint
	for _, tagUUID := range req.TagIDs {
		tag, err := repository.GetPhotoTagByUUID(tagUUID)
		if err == nil {
			tagIDs = append(tagIDs, tag.ID)
		}
	}

	photo := &model.Photo{
		Title:       req.Title,
		Description: req.Description,
		FileName:    filepath.Base(fh.Filename),
		StoreName:   storeName,
		MimeType:    mimeType,
		Size:        fh.Size,
		URL:         url,
		UserID:      userID,
	}

	if err := repository.CreatePhoto(photo, tagIDs); err != nil {
		os.Remove(dst)
		return nil, errors.New("保存记录失败")
	}

	// 重新加载标签
	result, _ := repository.GetPhotoByUUID(photo.UUID)
	if result != nil {
		photos := []model.Photo{*result}
		// loadPhotoTags is called inside ListPhotos, manually fetch here
		list, _, _ := repository.ListPhotos(1, 1, 0)
		if len(list) > 0 && list[0].UUID == result.UUID {
			return &list[0], nil
		}
		_ = photos
	}

	return photo, nil
}

// UpdatePhoto 更新照片信息
func UpdatePhoto(uuid string, req *model.UpdatePhotoReq) (*model.Photo, error) {
	photo, err := repository.GetPhotoByUUID(uuid)
	if err != nil {
		return nil, errors.New("照片不存在")
	}

	photo.Title = req.Title
	photo.Description = req.Description

	var tagIDs []uint
	for _, tagUUID := range req.TagIDs {
		tag, err := repository.GetPhotoTagByUUID(tagUUID)
		if err == nil {
			tagIDs = append(tagIDs, tag.ID)
		}
	}

	if err := repository.UpdatePhoto(photo, tagIDs); err != nil {
		return nil, errors.New("更新失败")
	}
	return photo, nil
}

// DeletePhoto 删除照片（同时删除文件）
func DeletePhoto(uuid string) error {
	photo, err := repository.GetPhotoByUUID(uuid)
	if err != nil {
		return errors.New("照片不存在")
	}
	dst := filepath.Join(photoUploadDir, photo.StoreName)
	os.Remove(dst)
	return repository.DeletePhoto(photo.ID)
}

// ListPublicPhotos 公开照片列表（瀑布流用）
func ListPublicPhotos(page, pageSize int, tagUUID string) ([]model.Photo, int64, error) {
	var tagID uint
	if tagUUID != "" {
		tag, err := repository.GetPhotoTagByUUID(tagUUID)
		if err == nil {
			tagID = tag.ID
		}
	}
	return repository.ListPhotos(page, pageSize, tagID)
}

// ListAllPublicPhotos 公开照片全部列表
func ListAllPublicPhotos(tagUUID string) ([]model.Photo, int64, error) {
	var tagID uint
	if tagUUID != "" {
		tag, err := repository.GetPhotoTagByUUID(tagUUID)
		if err == nil {
			tagID = tag.ID
		}
	}
	return repository.ListAllPhotos(tagID)
}

// ──── PhotoTag Service ────

func CreatePhotoTag(req *model.CreatePhotoTagReq) (*model.PhotoTag, error) {
	if _, err := repository.GetPhotoTagByName(req.Name); err == nil {
		return nil, errors.New("标签已存在")
	}
	tag := &model.PhotoTag{Name: req.Name}
	if err := repository.CreatePhotoTag(tag); err != nil {
		return nil, errors.New("创建标签失败")
	}
	return tag, nil
}

func UpdatePhotoTag(uuid string, req *model.UpdatePhotoTagReq) (*model.PhotoTag, error) {
	tag, err := repository.GetPhotoTagByUUID(uuid)
	if err != nil {
		return nil, errors.New("标签不存在")
	}
	tag.Name = req.Name
	if err := repository.UpdatePhotoTag(tag); err != nil {
		return nil, errors.New("更新失败")
	}
	return tag, nil
}

func DeletePhotoTag(uuid string) error {
	tag, err := repository.GetPhotoTagByUUID(uuid)
	if err != nil {
		return errors.New("标签不存在")
	}
	return repository.DeletePhotoTag(tag.ID)
}

func ListPhotoTags(page, pageSize int, search string) ([]model.PhotoTag, int64, error) {
	return repository.ListPhotoTags(page, pageSize, search)
}

func ListAllPhotoTags() ([]model.PhotoTag, error) {
	return repository.ListAllPhotoTags()
}

func GetPhotoTag(uuid string) (*model.PhotoTag, error) {
	return repository.GetPhotoTagByUUID(uuid)
}
