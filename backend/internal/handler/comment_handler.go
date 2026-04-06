package handler

import (
	"backend/internal/model"
	"backend/internal/pkg"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// @Summary      评论列表（公开）
// @Description  获取博客的顶级评论列表，含二级回复
// @Tags         comments
// @Produce      json
// @Param        id        path   int  true   "博客ID"
// @Param        page      query  int  false  "页码"
// @Param        pageSize  query  int  false  "每页数量"
// @Success      200  {object}  pkg.PageResponse
// @Router       /blogs/{id}/comments [get]
func listComments(c *gin.Context) {
	var query model.CommentListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	query.BlogUUID = parseUUID(c)
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 20
	}
	comments, total, err := service.ListCommentsByBlog(&query)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, comments, total, query.Page, query.PageSize)
}

// @Summary      发布评论
// @Tags         comments
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      model.CreateCommentReq  true  "评论内容"
// @Success      200   {object}  pkg.Response{data=model.Comment}
// @Failure      400   {object}  pkg.Response
// @Failure      401   {object}  pkg.Response
// @Router       /v1/comments [post]
func createComment(c *gin.Context) {
	var req model.CreateCommentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	uid := c.GetUint("user_id")
	comment, err := service.CreateComment(uid, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, comment)
}

// @Summary      更新评论
// @Tags         comments
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path      int                     true  "评论ID"
// @Param        body  body      model.UpdateCommentReq  true  "更新内容"
// @Success      200   {object}  pkg.Response{data=model.Comment}
// @Failure      403   {object}  pkg.Response
// @Router       /v1/comments/{id} [put]
func updateComment(c *gin.Context) {
	uuid := parseUUID(c)
	var req model.UpdateCommentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	uid := c.GetUint("user_id")
	role := c.GetString("role")
	comment, err := service.UpdateComment(uuid, uid, role, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, comment)
}

// @Summary      删除评论
// @Tags         comments
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "评论ID"
// @Success      200  {object}  pkg.Response
// @Failure      403  {object}  pkg.Response
// @Router       /v1/comments/{id} [delete]
func deleteComment(c *gin.Context) {
	uuid := parseUUID(c)
	uid := c.GetUint("user_id")
	role := c.GetString("role")
	if err := service.DeleteComment(uuid, uid, role); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "评论已删除")
}

// @Summary      点赞/取消点赞评论
// @Description  重复调用自动切换点赞状态
// @Tags         comments
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      int  true  "评论ID"
// @Success      200  {object}  pkg.Response
// @Failure      401  {object}  pkg.Response
// @Router       /v1/comments/{id}/like [post]
func likeComment(c *gin.Context) {
	uuid := parseUUID(c)
	uid := c.GetUint("user_id")
	liked, err := service.LikeComment(uuid, uid)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	msg := "点赞成功"
	if !liked {
		msg = "已取消点赞"
	}
	pkg.Success(c, gin.H{"liked": liked, "msg": msg})
}

// adminListAllComments 管理员查询所有评论
func adminListAllComments(c *gin.Context) {
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 20)
	comments, total, err := service.ListAllComments(page, pageSize)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, comments, total, page, pageSize)
}
