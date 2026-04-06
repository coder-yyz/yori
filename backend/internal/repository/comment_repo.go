package repository

import (
	"backend/internal/model"
	"backend/internal/pkg"

	"gorm.io/gorm"
)

// loadCommentsRelations 批量填充评论的 User 字段；includeReplies=true 时同时加载 Replies 及其 User
func loadCommentsRelations(comments []model.Comment, includeReplies bool) []model.Comment {
	if len(comments) == 0 {
		return comments
	}

	// 收集所有需要加载的 userID
	commentIDs := make([]uint, 0, len(comments))
	userIDSet := make(map[uint]bool)
	for _, c := range comments {
		commentIDs = append(commentIDs, c.ID)
		userIDSet[c.UserID] = true
	}

	var repliesByParent map[uint][]model.Comment
	if includeReplies {
		var replies []model.Comment
		DB.Where("parent_id IN ?", commentIDs).Find(&replies)
		repliesByParent = make(map[uint][]model.Comment)
		for _, r := range replies {
			userIDSet[r.UserID] = true
			repliesByParent[*r.ParentID] = append(repliesByParent[*r.ParentID], r)
		}
	}

	// 批量加载用户
	userIDs := make([]uint, 0, len(userIDSet))
	for id := range userIDSet {
		userIDs = append(userIDs, id)
	}
	var users []model.User
	DB.Where("id IN ?", userIDs).Find(&users)
	userMap := make(map[uint]model.UserBrief, len(users))
	for _, u := range users {
		userMap[u.ID] = u.ToBrief()
	}

	// 建立顶级评论 ID → UUID 映射，供回复评论填充 ParentUUID
	parentUUIDMap := make(map[uint]string, len(comments))
	for _, c := range comments {
		parentUUIDMap[c.ID] = c.UUID
	}

	// 组装
	for i := range comments {
		comments[i].User = userMap[comments[i].UserID]
		if includeReplies {
			rs := repliesByParent[comments[i].ID]
			for j := range rs {
				rs[j].User = userMap[rs[j].UserID]
				if rs[j].ParentID != nil {
					if uuid, ok := parentUUIDMap[*rs[j].ParentID]; ok {
						rs[j].ParentUUID = &uuid
					}
				}
			}
			comments[i].Replies = rs
		}
	}
	return comments
}

// CreateComment 创建评论并原子递增博客评论数
func CreateComment(c *model.Comment) error {
	if err := DB.Create(c).Error; err != nil {
		return err
	}
	DB.Model(&model.Blog{}).Where("id = ?", c.BlogID).
		UpdateColumn("total_comments", gorm.Expr("total_comments + 1"))
	return nil
}

// GetCommentByID 获取单条评论（含用户信息）
func GetCommentByID(id uint) (*model.Comment, error) {
	var c model.Comment
	if err := DB.First(&c, id).Error; err != nil {
		return nil, err
	}
	result := loadCommentsRelations([]model.Comment{c}, false)
	return &result[0], nil
}

// GetCommentByUUID 根据 UUID 获取单条评论（含用户信息）
func GetCommentByUUID(uuid string) (*model.Comment, error) {
	var c model.Comment
	if err := DB.Where("uuid = ?", uuid).First(&c).Error; err != nil {
		return nil, err
	}
	result := loadCommentsRelations([]model.Comment{c}, false)
	return &result[0], nil
}

// UpdateComment 更新评论
func UpdateComment(c *model.Comment) error {
	return DB.Save(c).Error
}

// DeleteComment 软删除评论，并重新统计博客评论数
func DeleteComment(id, blogID uint) error {
	if err := DB.Delete(&model.Comment{}, id).Error; err != nil {
		return err
	}
	var count int64
	DB.Model(&model.Comment{}).Where("blog_id = ? AND parent_id IS NULL", blogID).Count(&count)
	DB.Model(&model.Blog{}).Where("id = ?", blogID).UpdateColumn("total_comments", count)
	return nil
}

// ListCommentsByBlog 获取博客顶级评论列表（含回复，手动批量加载）
func ListCommentsByBlog(query *model.CommentListQuery) ([]model.Comment, int64, error) {
	db := DB.Model(&model.Comment{}).Where("blog_id = ? AND parent_id IS NULL", query.BlogID)

	var total int64
	db.Count(&total)

	var comments []model.Comment
	err := db.Offset(pkg.Offset(query.Page, query.PageSize)).Limit(query.PageSize).
		Order("created_at DESC").Find(&comments).Error
	if err != nil {
		return nil, 0, err
	}
	return loadCommentsRelations(comments, true), total, nil
}

// ListAllComments 管理后台查询所有评论
func ListAllComments(page, pageSize int) ([]model.Comment, int64, error) {
	var total int64
	DB.Model(&model.Comment{}).Count(&total)
	var comments []model.Comment
	err := DB.Offset(pkg.Offset(page, pageSize)).Limit(pageSize).
		Order("created_at DESC").Find(&comments).Error
	if err != nil {
		return nil, 0, err
	}
	return loadCommentsRelations(comments, true), total, nil
}

// LikeComment 点赞/取消点赞评论（防重复）
func LikeComment(commentID, userID uint) (bool, error) {
	var like model.CommentLike
	result := DB.Where("comment_id = ? AND user_id = ?", commentID, userID).First(&like)
	if result.Error == nil {
		DB.Delete(&like)
		DB.Model(&model.Comment{}).Where("id = ?", commentID).
			UpdateColumn("likes", gorm.Expr("likes - 1"))
		return false, nil
	}
	DB.Create(&model.CommentLike{CommentID: commentID, UserID: userID})
	DB.Model(&model.Comment{}).Where("id = ?", commentID).
		UpdateColumn("likes", gorm.Expr("likes + 1"))
	return true, nil
}

