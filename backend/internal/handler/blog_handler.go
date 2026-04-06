package handler

import (
	"strconv"

	"backend/internal/model"
	"backend/internal/pkg"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// @Summary      博客列表（公开）
// @Description  分页查询已发布博客，支持按分类/标签/关键词筛选
// @Tags         blogs
// @Produce      json
// @Param        page        query     int     false  "页码"
// @Param        pageSize    query     int     false  "每页数量"
// @Param        search      query     string  false  "关键词"
// @Param        categoryId  query     int     false  "分类ID"
// @Param        tagId       query     int     false  "标签ID"
// @Param        sortBy      query     string  false  "排序字段: created_at/total_views/total_favorites"
// @Param        sortOrder   query     string  false  "排序方向: asc/desc"
// @Success      200  {object}  pkg.PageResponse
// @Failure      400  {object}  pkg.Response
// @Router       /blogs [get]
func listPublicBlogs(c *gin.Context) {
	var query model.BlogListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 10
	}
	blogs, total, err := service.ListPublicBlogs(&query)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, blogs, total, query.Page, query.PageSize)
}

// @Summary      搜索博客
// @Description  全文搜索已发布博客，支持按标题/摘要/正文关键词搜索，支持分页
// @Tags         blogs
// @Produce      json
// @Param        q          query     string  true   "搜索关键词"
// @Param        page       query     int     false  "页码"
// @Param        pageSize   query     int     false  "每页数量"
// @Param        categoryId query     string  false  "分类ID"
// @Param        tagId      query     string  false  "标签ID"
// @Param        sortBy     query     string  false  "排序字段: created_at/total_views/total_favorites"
// @Param        sortOrder  query     string  false  "排序方向: asc/desc"
// @Success      200  {object}  pkg.PageResponse
// @Failure      400  {object}  pkg.Response
// @Router       /blogs/search [get]
func searchBlogs(c *gin.Context) {
	keyword := c.Query("q")
	if keyword == "" {
		pkg.Fail(c, "搜索关键词 q 不能为空")
		return
	}
	var query model.BlogListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 10
	}
	query.Search = keyword
	blogs, total, err := service.ListPublicBlogs(&query)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, blogs, total, query.Page, query.PageSize)
}

// @Summary      最新博客
// @Description  获取最新发布的 n 条博客，n 默认 5，最大 20
// @Tags         blogs
// @Produce      json
// @Param        n  query     int  false  "条数（默认5，最大20）"
// @Success      200  {object}  pkg.Response
// @Router       /blog/latest [get]
func latestBlogs(c *gin.Context) {
	n := 5
	if v := c.Query("n"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 {
			n = parsed
		}
	}
	if n > 20 {
		n = 20
	}
	query := &model.BlogListQuery{
		Page:      1,
		PageSize:  n,
		SortBy:    model.BlogSortCreatedAt,
		SortOrder: "desc",
	}
	blogs, _, err := service.ListPublicBlogs(query)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, blogs)
}

// @Summary      博客详情（公开）
// @Description  获取已发布博客详情（同时递增浏览量）
// @Tags         blogs
// @Produce      json
// @Param        id   path      int  true  "博客ID"
// @Success      200  {object}  pkg.Response{data=model.Blog}
// @Failure      404  {object}  pkg.Response
// @Router       /blogs/{id} [get]
func getPublicBlog(c *gin.Context) {
	uuid := parseUUID(c)
	blog, err := service.GetBlog(uuid, true)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c,  blog)
}

// @Summary      创建博客
// @Description  作者/管理员创建博客，默认草稿状态
// @Tags         blogs
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      model.CreateBlogReq  true  "博客内容"
// @Success      200   {object}  pkg.Response{data=model.Blog}
// @Failure      400   {object}  pkg.Response
// @Failure      401   {object}  pkg.Response
// @Router       /v1/blogs [post]
func createBlog(c *gin.Context) {
	var req model.CreateBlogReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	uid := c.GetUint("user_id")
	blog, err := service.CreateBlog(uid, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c,  blog)
}

// @Summary      更新博客
// @Description  作者只能更新自己的博客，管理员可更新任意博客
// @Tags         blogs
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      int                  true  "博客ID"
// @Param        body  body      model.UpdateBlogReq  true  "更新内容"
// @Success      200   {object}  pkg.Response{data=model.Blog}
// @Failure      400   {object}  pkg.Response
// @Failure      403   {object}  pkg.Response
// @Router       /v1/blogs/{id} [put]
func updateBlog(c *gin.Context) {
	uuid := parseUUID(c)
	var req model.UpdateBlogReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	uid := c.GetUint("user_id")
	role := c.GetString("role")
	blog, err := service.UpdateBlog(uuid, uid, role, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c,  blog)
}

// @Summary      删除博客
// @Description  软删除博客，作者只能删除自己的博客
// @Tags         blogs
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "博客ID"
// @Success      200  {object}  pkg.Response
// @Failure      403  {object}  pkg.Response
// @Router       /v1/blogs/{id} [delete]
func deleteBlog(c *gin.Context) {
	uuid := parseUUID(c)
	uid := c.GetUint("user_id")
	role := c.GetString("role")
	if err := service.DeleteBlog(uuid, uid, role); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "博客已删除")
}

// listMyBlogs 查询我的博客
func listMyBlogs(c *gin.Context) {
	var query model.BlogListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 10
	}
	uid := c.GetUint("user_id")
	blogs, total, err := service.ListMyBlogs(uid, &query)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, blogs, total, query.Page, query.PageSize)
}

// adminListAllBlogs 管理员查询所有博客
func adminListAllBlogs(c *gin.Context) {
	var query model.BlogListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 10
	}
	blogs, total, err := service.ListAllBlogs(&query)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, blogs, total, query.Page, query.PageSize)
}

// adminGetBlog 管理员获取任意博客（含草稿）
func adminGetBlog(c *gin.Context) {
	uuid := parseUUID(c)
	blog, err := service.GetBlog(uuid, false)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c,  blog)
}

// shareBlog 记录分享
func shareBlog(c *gin.Context) {
	uuid := parseUUID(c)
	uid := c.GetUint("user_id")
	ip := c.ClientIP()
	if err := service.ShareBlog(uuid, uid, ip); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "分享成功")
}

// toggleFavorite 收藏/取消收藏博客
func toggleFavorite(c *gin.Context) {
	uuid := parseUUID(c)
	uid := c.GetUint("user_id")
	favorited, err := service.ToggleFavorite(uid, uuid)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	msg := "收藏成功"
	if !favorited {
		msg = "已取消收藏"
	}
	pkg.Success(c, gin.H{"favorited": favorited, "msg": msg})
}

// listMyFavorites 查询收藏列表
func listMyFavorites(c *gin.Context) {
	uid := c.GetUint("user_id")
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 10)
	blogs, total, err := service.ListMyFavorites(uid, page, pageSize)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, blogs, total, page, pageSize)
}
