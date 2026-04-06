package model

// 标签模型
type Tag struct {
	BaseModel
	Name      string `json:"name" gorm:"uniqueIndex;size:64;not null"`
	BlogCount int64  `json:"blogCount" gorm:"-"`
}

// ---- Request DTOs ----

type CreateTagReq struct {
	Name string `json:"name" binding:"required,max=64"`
}

type UpdateTagReq struct {
	Name string `json:"name" binding:"required,max=64"`
}
