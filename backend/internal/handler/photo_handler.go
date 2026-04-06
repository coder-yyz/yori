package handler

import (
	"backend/internal/model"
	"backend/internal/pkg"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// ──── 公开接口 ────

func listPublicPhotos(c *gin.Context) {
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 20)
	tagUUID := c.Query("tag")
	photos, total, err := service.ListPublicPhotos(page, pageSize, tagUUID)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, photos, total, page, pageSize)
}

func listAllPublicPhotos(c *gin.Context) {
	tagUUID := c.Query("tag")
	photos, total, err := service.ListAllPublicPhotos(tagUUID)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, gin.H{"list": photos, "total": total})
}

func listPublicPhotoTags(c *gin.Context) {
	tags, err := service.ListAllPhotoTags()
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, tags)
}

// ──── 管理接口 ────

func adminUploadPhoto(c *gin.Context) {
	fh, err := c.FormFile("file")
	if err != nil {
		pkg.Fail(c, "请选择要上传的文件")
		return
	}

	var req model.CreatePhotoReq
	req.Title = c.PostForm("title")
	req.Description = c.PostForm("description")
	// 标签 UUID 列表，以逗号分隔
	if tagsStr := c.PostForm("tagIds"); tagsStr != "" {
		for _, s := range splitTags(tagsStr) {
			if s != "" {
				req.TagIDs = append(req.TagIDs, s)
			}
		}
	}

	uid := c.GetUint("user_id")
	photo, err := service.UploadPhoto(uid, fh, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, photo)
}

func adminUpdatePhoto(c *gin.Context) {
	uuid := parseUUID(c)
	var req model.UpdatePhotoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	photo, err := service.UpdatePhoto(uuid, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, photo)
}

func adminDeletePhoto(c *gin.Context) {
	uuid := parseUUID(c)
	if err := service.DeletePhoto(uuid); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, nil)
}

func adminListPhotos(c *gin.Context) {
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 20)
	tagUUID := c.Query("tag")
	photos, total, err := service.ListPublicPhotos(page, pageSize, tagUUID)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, photos, total, page, pageSize)
}

// ──── PhotoTag 管理 ────

func adminCreatePhotoTag(c *gin.Context) {
	var req model.CreatePhotoTagReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	tag, err := service.CreatePhotoTag(&req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, tag)
}

func adminUpdatePhotoTag(c *gin.Context) {
	uuid := parseUUID(c)
	var req model.UpdatePhotoTagReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	tag, err := service.UpdatePhotoTag(uuid, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, tag)
}

func adminDeletePhotoTag(c *gin.Context) {
	uuid := parseUUID(c)
	if err := service.DeletePhotoTag(uuid); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, nil)
}

func adminListPhotoTags(c *gin.Context) {
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 50)
	search := c.Query("search")
	tags, total, err := service.ListPhotoTags(page, pageSize, search)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, tags, total, page, pageSize)
}

func adminGetPhotoTag(c *gin.Context) {
	uuid := parseUUID(c)
	tag, err := service.GetPhotoTag(uuid)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, tag)
}

// splitTags 分割逗号分隔的标签列表
func splitTags(s string) []string {
	var result []string
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] == ',' {
			part := s[start:i]
			if part != "" {
				result = append(result, part)
			}
			start = i + 1
		}
	}
	if start < len(s) {
		result = append(result, s[start:])
	}
	return result
}
