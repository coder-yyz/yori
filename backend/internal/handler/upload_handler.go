package handler

import (
	"backend/internal/pkg"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// @Summary      上传文件
// @Description  上传单个文件（支持图片/PDF/视频/音频），大小限制 20MB，返回文件记录及可访问链接
// @Tags         uploads
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        file  formData  file  true  "要上传的文件"
// @Success      200   {object}  pkg.Response{data=model.Upload}  "上传成功，返回文件记录"
// @Failure      400   {object}  pkg.Response                     "文件类型不支持或超出大小限制"
// @Failure      401   {object}  pkg.Response                     "未登录"
// @Failure      500   {object}  pkg.Response                     "服务器内部错误"
// @Router       /uploads [post]
func uploadFile(c *gin.Context) {
	fh, err := c.FormFile("file")
	if err != nil {
		pkg.Fail(c, "请选择要上传的文件")
		return
	}

	uid := c.GetUint("user_id")
	userUUID := c.GetString("user_uuid")

	record, err := service.UploadFile(uid, userUUID, fh)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, record)
}

// @Summary      我的上传记录
// @Description  分页查询当前登录用户的文件上传列表
// @Tags         uploads
// @Produce      json
// @Security     BearerAuth
// @Param        page      query  int  false  "页码，默认 1"
// @Param        pageSize  query  int  false  "每页数量，默认 20"
// @Success      200  {object}  pkg.PageResponse  "上传记录列表"
// @Failure      401  {object}  pkg.Response      "未登录"
// @Router       /uploads [get]
func listMyUploads(c *gin.Context) {
	uid := c.GetUint("user_id")
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 20)
	list, total, err := service.ListMyUploads(uid, page, pageSize)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, list, total, page, pageSize)
}

// @Summary      删除上传文件
// @Description  删除文件及其数据库记录；普通用户只能删除自己上传的文件，管理员可删任意文件
// @Tags         uploads
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "文件 UUID"
// @Success      200  {object}  pkg.Response  "删除成功"
// @Failure      401  {object}  pkg.Response  "未登录"
// @Failure      403  {object}  pkg.Response  "无权限"
// @Failure      404  {object}  pkg.Response  "文件不存在"
// @Router       /uploads/{id} [delete]
// @Router       /admin/uploads/{id} [delete]
func deleteUpload(c *gin.Context) {
	uuid := parseUUID(c)
	uid := c.GetUint("user_id")
	role := c.GetString("role")
	if err := service.DeleteUpload(uuid, uid, role); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "文件已删除")
}

// @Summary      所有上传记录（管理员）
// @Description  管理员分页查询全站所有用户的文件上传记录
// @Tags         uploads
// @Produce      json
// @Security     BearerAuth
// @Param        page      query  int  false  "页码，默认 1"
// @Param        pageSize  query  int  false  "每页数量，默认 20"
// @Success      200  {object}  pkg.PageResponse  "上传记录列表"
// @Failure      401  {object}  pkg.Response      "未登录"
// @Failure      403  {object}  pkg.Response      "无管理员权限"
// @Router       /admin/uploads [get]
func adminListAllUploads(c *gin.Context) {
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 20)
	list, total, err := service.ListAllUploads(page, pageSize)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, list, total, page, pageSize)
}
