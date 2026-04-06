package model

// 分类模型
type Category struct {
	BaseModel
	Name        string     `json:"name" gorm:"uniqueIndex;size:64;not null"`
	Slug        string     `json:"slug" gorm:"uniqueIndex;size:64"`
	Description string     `json:"description" gorm:"type:text"`
	CoverURL    string     `json:"coverUrl" gorm:"size:512"`
	ParentID    *uint      `json:"parentId" gorm:"index"` // 支持父子分类
	Children    []Category `json:"children,omitempty" gorm:"-"` // 由 Repository 层手动填充
	BlogCount   int64      `json:"blogCount" gorm:"-"`
}

// ---- Request DTOs ----

type CreateCategoryReq struct {
	Name        string `json:"name" binding:"required,max=64"`
	Slug        string `json:"slug" binding:"omitempty,max=64"`
	Description string `json:"description" binding:"omitempty,max=500"`
	CoverURL    string `json:"coverUrl" binding:"omitempty,max=512,url"`
	ParentID    *uint  `json:"parentId"`
}

type UpdateCategoryReq struct {
	Name        string `json:"name" binding:"omitempty,max=64"`
	Slug        string `json:"slug" binding:"omitempty,max=64"`
	Description string `json:"description" binding:"omitempty,max=500"`
	CoverURL    string `json:"coverUrl" binding:"omitempty,max=512"`
	ParentID    *uint  `json:"parentId"`
}
