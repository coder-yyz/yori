package handler

import (
	"backend/internal/model"
	"backend/internal/pkg"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// @Summary      标签列表（公开）
// @Tags         tags
// @Produce      json
// @Param        page      query  int     false  "页码"
// @Param        pageSize  query  int     false  "每页数量"
// @Param        search    query  string  false  "搜索关键词"
// @Success      200  {object}  pkg.PageResponse
// @Router       /tags [get]
func listTags(c *gin.Context) {
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 50)
	search := c.Query("search")
	tags, total, err := service.ListTags(page, pageSize, search)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, tags, total, page, pageSize)
}

// @Summary      全部标签（公开，无分页）
// @Tags         tags
// @Produce      json
// @Success      200  {object}  pkg.Response{data=[]model.Tag}
// @Router       /tags/all [get]
func listAllTagsHandler(c *gin.Context) {
	tags, err := service.ListAllTags()
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, tags)
}

// @Summary      标签详情（公开）
// @Tags         tags
// @Produce      json
// @Param        id   path      int  true  "标签ID"
// @Success      200  {object}  pkg.Response{data=model.Tag}
// @Failure      404  {object}  pkg.Response
// @Router       /tags/{id} [get]
func getTag(c *gin.Context) {
	uuid := parseUUID(c)
	tag, err := service.GetTag(uuid)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, tag)
}

// @Summary      创建标签
// @Tags         tags
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      model.CreateTagReq  true  "标签信息"
// @Success      200   {object}  pkg.Response{data=model.Tag}
// @Router       /admin/tags [post]
func createTag(c *gin.Context) {
	var req model.CreateTagReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	tag, err := service.CreateTag(&req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, tag)
}

// @Summary      更新标签
// @Tags         tags
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      int                  true  "标签ID"
// @Param        body  body      model.UpdateTagReq   true  "更新内容"
// @Success      200   {object}  pkg.Response{data=model.Tag}
// @Router       /admin/tags/{id} [put]
func updateTag(c *gin.Context) {
	uuid := parseUUID(c)
	var req model.UpdateTagReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	tag, err := service.UpdateTag(uuid, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, tag)
}

// @Summary      删除标签
// @Tags         tags
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "标签ID"
// @Success      200  {object}  pkg.Response
// @Router       /admin/tags/{id} [delete]
func deleteTag(c *gin.Context) {
	uuid := parseUUID(c)
	if err := service.DeleteTag(uuid); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "标签已删除")
}
