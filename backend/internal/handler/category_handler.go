package handler

import (
	"backend/internal/model"
	"backend/internal/pkg"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// @Summary      分类列表（公开）
// @Description  分页查询顶级分类，含子分类和博客数
// @Tags         categories
// @Produce      json
// @Param        page      query  int  false  "页码"
// @Param        pageSize  query  int  false  "每页数量"
// @Success      200  {object}  pkg.PageResponse
// @Router       /categories [get]
func listCategories(c *gin.Context) {
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 50)
	categories, total, err := service.ListCategories(page, pageSize)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, categories, total, page, pageSize)
}

// @Summary      分类详情（公开）
// @Tags         categories
// @Produce      json
// @Param        id   path      int  true  "分类ID"
// @Success      200  {object}  pkg.Response{data=model.Category}
// @Failure      404  {object}  pkg.Response
// @Router       /categories/{id} [get]
func getCategory(c *gin.Context) {
	uuid := parseUUID(c)
	cat, err := service.GetCategory(uuid)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, cat)
}

// @Summary      全部分类（公开，无分页）
// @Description  用于前端下拉选择
// @Tags         categories
// @Produce      json
// @Success      200  {object}  pkg.Response{data=[]model.Category}
// @Router       /categories/all [get]
func listAllCategoriesHandler(c *gin.Context) {
	cats, err := service.ListAllCategories()
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, cats)
}

// @Summary      创建分类
// @Tags         categories
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      model.CreateCategoryReq  true  "分类信息"
// @Success      200   {object}  pkg.Response{data=model.Category}
// @Failure      400   {object}  pkg.Response
// @Router       /admin/categories [post]
func createCategory(c *gin.Context) {
	var req model.CreateCategoryReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	cat, err := service.CreateCategory(&req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, cat)
}

// @Summary      更新分类
// @Tags         categories
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      int                      true  "分类ID"
// @Param        body  body      model.UpdateCategoryReq  true  "更新内容"
// @Success      200   {object}  pkg.Response{data=model.Category}
// @Router       /admin/categories/{id} [put]
func updateCategory(c *gin.Context) {
	uuid := parseUUID(c)
	var req model.UpdateCategoryReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	cat, err := service.UpdateCategory(uuid, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, cat)
}

// @Summary      删除分类
// @Tags         categories
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "分类ID"
// @Success      200  {object}  pkg.Response
// @Router       /admin/categories/{id} [delete]
func deleteCategory(c *gin.Context) {
	uuid := parseUUID(c)
	if err := service.DeleteCategory(uuid); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "分类已删除")
}
