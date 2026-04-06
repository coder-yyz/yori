package model

// Upload 文件上传记录
type Upload struct {
	BaseModel
	UserID    uint   `json:"-"           gorm:"column:user_id;index"`
	FileName  string `json:"fileName"    gorm:"size:255;not null"`  // 原始文件名
	StoreName string `json:"-"           gorm:"size:255;not null"`  // 磁盘存储文件名（UUID+ext）
	MimeType  string `json:"mimeType"    gorm:"size:128"`
	Size      int64  `json:"size"`                                   // 字节数
	URL       string `json:"url"         gorm:"size:512;not null"`  // 可访问链接
	UserUUID  string `json:"uploadedBy"  gorm:"-"`                  // 响应时填充
}
