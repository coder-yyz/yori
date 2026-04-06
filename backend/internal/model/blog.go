package model

// 博客状态常量
const (
	BlogStatusDraft     = "draft"
	BlogStatusPublished = "published"
)

// 博客排序字段
const (
	BlogSortCreatedAt      = "created_at"
	BlogSortTotalViews     = "total_views"
	BlogSortTotalFavorites = "total_favorites"
)

// BlogTag 博客-标签关联表（无外键约束，由代码手动管理）
type BlogTag struct {
	BlogID uint `gorm:"primaryKey;index"`
	TagID  uint `gorm:"primaryKey;index"`
}

// BlogCategory 博客-分类关联表（无外键约束，由代码手动管理）
type BlogCategory struct {
	BlogID     uint `gorm:"primaryKey;index"`
	CategoryID uint `gorm:"primaryKey;index"`
}

// 博客内容格式
const (
	ContentTypeMarkdown = "markdown"
)

// Blog 博客（仅含标量列；关联字段标注 gorm:"-" 由代码组装，不产生任何外键 DDL）
type Blog struct {
	BaseModel
	Title           string `json:"title" gorm:"not null;size:256"`
	Content         string `json:"content" gorm:"type:text"`
	ContentType     string `json:"contentType" gorm:"size:16;default:'markdown'"` // markdown, html
	Description     string `json:"description" gorm:"type:text"`
	CoverURL        string `json:"coverUrl" gorm:"size:512"`
	Status          string `json:"status" gorm:"size:16;default:'draft'"` // draft, published, archived
	AuthorID        uint   `json:"-" gorm:"not null;index"`
	MetaTitle       string `json:"metaTitle" gorm:"size:256"`
	MetaDescription string `json:"metaDescription" gorm:"type:text"`
	MetaKeywords    string `json:"metaKeywords" gorm:"size:512"`
	TotalViews      int64  `json:"totalViews" gorm:"default:0"`
	TotalShares     int64  `json:"totalShares" gorm:"default:0"`
	TotalComments   int64  `json:"totalComments" gorm:"default:0"`
	TotalFavorites  int64  `json:"totalFavorites" gorm:"default:0"`
	// 以下字段不写入数据库，由 Repository 层手动批量查询后填充
	Author     UserBrief  `json:"author" gorm:"-"`
	Tags       []Tag      `json:"tags" gorm:"-"`
	Categories []Category `json:"categories" gorm:"-"`
}

// ---- Request DTOs ----

type CreateBlogReq struct {
	Title           string   `json:"title" binding:"required,max=256"`
	Content         string   `json:"content"`
	ContentType     string   `json:"contentType" binding:"omitempty,oneof=markdown html"`
	Description     string   `json:"description" binding:"omitempty,max=1000"`
	CoverURL        string   `json:"coverUrl" binding:"omitempty,max=512"`
	Status          string   `json:"status" binding:"omitempty,oneof=draft published archived"`
	TagUUIDs        []string `json:"tagIds"`
	CategoryUUIDs   []string `json:"categoryIds"`
	MetaTitle       string   `json:"metaTitle" binding:"omitempty,max=256"`
	MetaDescription string   `json:"metaDescription" binding:"omitempty,max=500"`
	MetaKeywords    string   `json:"metaKeywords" binding:"omitempty,max=512"`
}

type UpdateBlogReq struct {
	Title           string   `json:"title" binding:"omitempty,max=256"`
	Content         string   `json:"content"`
	ContentType     string   `json:"contentType" binding:"omitempty,oneof=markdown html"`
	Description     string   `json:"description" binding:"omitempty,max=1000"`
	CoverURL        string   `json:"coverUrl" binding:"omitempty,max=512"`
	Status          string   `json:"status" binding:"omitempty,oneof=draft published archived"`
	TagUUIDs        []string `json:"tagIds"`
	CategoryUUIDs   []string `json:"categoryIds"`
	MetaTitle       string   `json:"metaTitle" binding:"omitempty,max=256"`
	MetaDescription string   `json:"metaDescription" binding:"omitempty,max=500"`
	MetaKeywords    string   `json:"metaKeywords" binding:"omitempty,max=512"`
}

type BlogListQuery struct {
	Page         int    `form:"page,default=1" binding:"min=1"`
	PageSize     int    `form:"pageSize,default=10" binding:"min=1,max=100"`
	Status       string `form:"status" binding:"omitempty,oneof=draft published archived"`
	CategoryUUID string `form:"categoryId"` // 客户端传 UUID，由 service 层解析为内部 ID
	TagUUID      string `form:"tagId"`      // 客户端传 UUID，由 service 层解析为内部 ID
	Search       string `form:"search"`
	SortBy       string `form:"sortBy,default=created_at"`
	SortOrder    string `form:"sortOrder,default=desc" binding:"omitempty,oneof=asc desc"`
	// 以下字段由 service/handler 层内部赋值，不绑定自 query string
	AuthorID   uint `form:"-"`
	CategoryID uint `form:"-"`
	TagID      uint `form:"-"`
}
