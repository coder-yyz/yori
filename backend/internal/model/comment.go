package model

// Comment 评论模型（支持二级回复；关联字段由代码手动填充，不产生外键 DDL）
type Comment struct {
	BaseModel
	BlogID   uint   `json:"-" gorm:"not null;index"`
	UserID   uint   `json:"-" gorm:"not null;index"`
	Content  string `json:"content" gorm:"type:text;not null"`
	ParentID *uint  `json:"-" gorm:"index"` // nil = 顶级评论，内部使用整数 FK
	Likes    int64  `json:"likes" gorm:"default:0"`
	// 以下字段不写入数据库，由 Repository 层手动批量查询后填充
	ParentUUID *string   `json:"parentId,omitempty" gorm:"-"` // 父评论 UUID，供客户端使用
	User       UserBrief `json:"user" gorm:"-"`
	Replies    []Comment `json:"replies,omitempty" gorm:"-"`
}

// CommentLike 评论点赞（防重复）
type CommentLike struct {
	BaseModel
	CommentID uint `json:"-" gorm:"uniqueIndex:comment_user_like_idx;not null"`
	UserID    uint `json:"-" gorm:"uniqueIndex:comment_user_like_idx;not null"`
}

// ---- Request DTOs ----

type CreateCommentReq struct {
	BlogUUID   string  `json:"blogId" binding:"required"`  // 博客 UUID
	Content    string  `json:"content" binding:"required,min=1,max=2000"`
	ParentUUID *string `json:"parentId"` // 父评论 UUID（回复时填写）
}

type UpdateCommentReq struct {
	Content string `json:"content" binding:"required,min=1,max=2000"`
}

type CommentListQuery struct {
	Page     int    `form:"page,default=1" binding:"min=1"`
	PageSize int    `form:"pageSize,default=20" binding:"min=1,max=100"`
	BlogUUID string `form:"-"` // 由 handler 从路由参数注入，不绑定 query string
	BlogID   uint   `form:"-"` // 由 service 层从 BlogUUID 解析后注入
}

