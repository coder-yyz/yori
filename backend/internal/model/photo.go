package model

// Photo 照片墙记录
type Photo struct {
	BaseModel
	Title       string `json:"title"       gorm:"size:256"`
	Description string `json:"description" gorm:"type:text"`
	FileName    string `json:"fileName"    gorm:"size:255;not null"`
	StoreName   string `json:"-"           gorm:"size:255;not null"`
	MimeType    string `json:"mimeType"    gorm:"size:128"`
	Size        int64  `json:"size"`
	Width       int    `json:"width"       gorm:"default:0"`
	Height      int    `json:"height"      gorm:"default:0"`
	URL         string `json:"url"         gorm:"size:512;not null"`
	UserID      uint   `json:"-"           gorm:"index"`
	// 关联字段，不写入数据库
	Tags []PhotoTag `json:"tags" gorm:"-"`
}

// PhotoTag 照片标签
type PhotoTag struct {
	BaseModel
	Name       string `json:"name"       gorm:"uniqueIndex;size:64;not null"`
	PhotoCount int64  `json:"photoCount" gorm:"-"`
}

// PhotoTagLink 照片-标签关联表
type PhotoTagLink struct {
	PhotoID    uint `gorm:"primaryKey;index"`
	PhotoTagID uint `gorm:"primaryKey;index"`
}

// ---- Request DTOs ----

type CreatePhotoReq struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	TagIDs      []string `json:"tagIds"`
}

type UpdatePhotoReq struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	TagIDs      []string `json:"tagIds"`
}

type CreatePhotoTagReq struct {
	Name string `json:"name" binding:"required,max=64"`
}

type UpdatePhotoTagReq struct {
	Name string `json:"name" binding:"required,max=64"`
}
