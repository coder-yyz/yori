package service

import (
	"errors"

	"backend/internal/model"
	"backend/internal/repository"
)

// CreateComment 创建评论，BlogUUID/ParentUUID 解析为内部整数 ID
func CreateComment(userID uint, req *model.CreateCommentReq) (*model.Comment, error) {
	// 解析博客 UUID → 整数 ID
	blog, err := repository.GetBlogByUUID(req.BlogUUID)
	if err != nil {
		return nil, errors.New("博客不存在")
	}
	if blog.Status != model.BlogStatusPublished {
		return nil, errors.New("博客未发布，无法评论")
	}

	// 解析父评论 UUID → 整数 ID
	var parentID *uint
	if req.ParentUUID != nil {
		parent, err := repository.GetCommentByUUID(*req.ParentUUID)
		if err != nil {
			return nil, errors.New("父评论不存在")
		}
		if parent.ParentID != nil {
			return nil, errors.New("不支持多级嵌套回复")
		}
		parentID = &parent.ID
	}

	comment := &model.Comment{
		BlogID:   blog.ID,
		UserID:   userID,
		Content:  req.Content,
		ParentID: parentID,
	}
	if err := repository.CreateComment(comment); err != nil {
		return nil, errors.New("发表评论失败")
	}

	result, _ := repository.GetCommentByID(comment.ID)
	return result, nil
}

// UpdateComment 根据 UUID 更新评论（只有作者或管理员可操作）
func UpdateComment(uuid string, operatorID uint, role string, req *model.UpdateCommentReq) (*model.Comment, error) {
	comment, err := repository.GetCommentByUUID(uuid)
	if err != nil {
		return nil, errors.New("评论不存在")
	}
	if role != model.RoleAdmin && comment.UserID != operatorID {
		return nil, errors.New("无权限修改此评论")
	}
	comment.Content = req.Content
	if err := repository.UpdateComment(comment); err != nil {
		return nil, errors.New("更新评论失败")
	}
	return comment, nil
}

// DeleteComment 根据 UUID 删除评论（只有作者或管理员可操作）
func DeleteComment(uuid string, operatorID uint, role string) error {
	comment, err := repository.GetCommentByUUID(uuid)
	if err != nil {
		return errors.New("评论不存在")
	}
	if role != model.RoleAdmin && comment.UserID != operatorID {
		return errors.New("无权限删除此评论")
	}
	return repository.DeleteComment(comment.ID, comment.BlogID)
}

// ListCommentsByBlog 查询博客评论列表（BlogUUID → BlogID 由此处解析）
func ListCommentsByBlog(query *model.CommentListQuery) ([]model.Comment, int64, error) {
	blog, err := repository.GetBlogByUUID(query.BlogUUID)
	if err != nil {
		return nil, 0, errors.New("博客不存在")
	}
	query.BlogID = blog.ID
	return repository.ListCommentsByBlog(query)
}

// ListAllComments 管理员查询所有评论
func ListAllComments(page, pageSize int) ([]model.Comment, int64, error) {
	return repository.ListAllComments(page, pageSize)
}

// LikeComment 根据 UUID 点赞/取消点赞评论
func LikeComment(commentUUID string, userID uint) (bool, error) {
	comment, err := repository.GetCommentByUUID(commentUUID)
	if err != nil {
		return false, errors.New("评论不存在")
	}
	return repository.LikeComment(comment.ID, userID)
}


