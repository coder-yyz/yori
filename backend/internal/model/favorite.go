package model

// Favorite 博客收藏模型
type Favorite struct {
	BaseModel
	UserID uint `json:"userId" gorm:"uniqueIndex:user_blog_fav_idx;not null"`
	BlogID uint `json:"blogId" gorm:"uniqueIndex:user_blog_fav_idx;not null"`
}

// BlogShare 分享记录
type BlogShare struct {
	BaseModel
	BlogID uint   `json:"blogId" gorm:"not null;index"`
	UserID uint   `json:"userId" gorm:"index"` // 0 = 匿名
	IP     string `json:"ip" gorm:"size:64"`
}
