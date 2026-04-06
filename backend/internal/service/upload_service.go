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

// 允许的 MIME 类型白名单
var allowedMIME = map[string]bool{
	"image/jpeg":      true,
	"image/png":       true,
	"image/gif":       true,
	"image/webp":      true,
	"image/svg+xml":   true,
	"application/pdf": true,
	"video/mp4":       true,
	"audio/mpeg":      true,
}

const maxFileSize = 20 << 20 // 20 MB

// UploadFile 保存上传文件到本地，写入记录并返回
func UploadFile(userID uint, userUUID string, fh *multipart.FileHeader) (*model.Upload, error) {
	if fh.Size > maxFileSize {
		return nil, fmt.Errorf("文件大小不能超过 20MB，当前: %.2f MB", float64(fh.Size)/(1<<20))
	}

	// 校验 MIME 类型
	mimeType := fh.Header.Get("Content-Type")
	// 去掉可能的参数部分，如 "image/jpeg; charset=utf-8"
	mimeType = strings.ToLower(strings.Split(mimeType, ";")[0])
	if !allowedMIME[mimeType] {
		return nil, errors.New("不支持的文件类型: " + mimeType)
	}

	// 从原始文件名中提取后缀（限制只取已知安全后缀）
	ext := strings.ToLower(filepath.Ext(fh.Filename))

	// 以随机 UUID 命名存储文件，防止路径遍历和覆盖
	storeName := model.NewPublicUUID() + ext

	// 上传目录：uploads/<year>/<month>/
	uploadDir := filepath.Join("uploads")
	if err := os.MkdirAll(uploadDir, 0750); err != nil {
		return nil, errors.New("创建上传目录失败")
	}

	dst := filepath.Join(uploadDir, storeName)
	// 防止路径遍历：确保目标路径在 uploadDir 内
	absUpload, _ := filepath.Abs(uploadDir)
	absDst, _ := filepath.Abs(dst)
	if !strings.HasPrefix(absDst, absUpload+string(filepath.Separator)) {
		return nil, errors.New("非法文件路径")
	}

	src, err := fh.Open()
	if err != nil {
		return nil, errors.New("无法读取上传文件")
	}
	defer src.Close()

	// 安全写入：先写临时文件，再原子性重命名
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
			if written > maxFileSize {
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

	// 生成可访问 URL（使用相对路径，由前端/Nginx 拼接域名）
	url := fmt.Sprintf("/uploads/%s", storeName)

	record := &model.Upload{
		UserID:    userID,
		FileName:  filepath.Base(fh.Filename),
		StoreName: storeName,
		MimeType:  mimeType,
		Size:      fh.Size,
		URL:       url,
		UserUUID:  userUUID,
	}
	if err := repository.CreateUpload(record); err != nil {
		// 写库失败时删除已上传文件
		os.Remove(dst)
		return nil, errors.New("保存记录失败")
	}
	return record, nil
}

// ListMyUploads 查询当前用户的上传记录
// normalizeUploadURLs 将旧的绝对 URL 统一转为相对路径
func normalizeUploadURLs(list []model.Upload) {
	for i := range list {
		if idx := strings.Index(list[i].URL, "/uploads/"); idx > 0 {
			list[i].URL = list[i].URL[idx:]
		}
	}
}

func ListMyUploads(userID uint, page, pageSize int) ([]model.Upload, int64, error) {
	list, total, err := repository.ListUploadsByUser(userID, page, pageSize)
	if err == nil {
		normalizeUploadURLs(list)
	}
	return list, total, err
}

// ListAllUploads 管理员查询所有上传记录
func ListAllUploads(page, pageSize int) ([]model.Upload, int64, error) {
	list, total, err := repository.ListAllUploads(page, pageSize)
	if err == nil {
		normalizeUploadURLs(list)
	}
	return list, total, err
}

// DeleteUpload 删除上传记录（同时删除文件）
func DeleteUpload(uuid string, operatorID uint, role string) error {
	record, err := repository.GetUploadByUUID(uuid)
	if err != nil {
		return errors.New("文件记录不存在")
	}
	if role != "admin" && role != "root" && record.UserID != operatorID {
		return errors.New("无权限删除此文件")
	}

	// 删除磁盘文件
	dst := filepath.Join("uploads", record.StoreName)
	_ = os.Remove(dst) // 文件不存在也继续删记录

	return repository.DeleteUpload(record.ID)
}
