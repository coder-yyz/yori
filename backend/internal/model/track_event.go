package model

import "time"

// TrackEvent 前端埋点事件
type TrackEvent struct {
	BaseModel
	EventType   string    `json:"eventType"   gorm:"size:32;index;not null"`
	EventName   string    `json:"eventName"   gorm:"size:128;index;not null"`
	PagePath    string    `json:"pagePath"    gorm:"size:512;index"`
	PageURL     string    `json:"pageUrl"     gorm:"size:1024"`
	Referrer    string    `json:"referrer"    gorm:"size:1024"`
	UserAgent   string    `json:"userAgent"   gorm:"size:512"`
	Language    string    `json:"language"    gorm:"size:32"`
	TimeZone    string    `json:"timeZone"    gorm:"size:64"`
	Screen      string    `json:"screen"      gorm:"size:64"`
	SessionID   string    `json:"sessionId"   gorm:"size:64;index"`
	AnonymousID string    `json:"anonymousId" gorm:"size:64;index"`
	UserUUID    string    `json:"userId"      gorm:"size:36;index"`
	Role        string    `json:"role"        gorm:"size:32"`
	IP          string    `json:"ip"          gorm:"size:64"`
	City        string    `json:"city"        gorm:"size:64"`
	Country     string    `json:"country"     gorm:"size:64"`
	IsLoggedIn  bool      `json:"isLoggedIn"`
	LogTime     time.Time `json:"logTime"     gorm:"index"`
	OccurredAt  time.Time `json:"occurredAt"  gorm:"index;not null"`
	UserInfo    string    `json:"userInfo"    gorm:"type:TEXT"`
	MetaJSON    string    `json:"meta"        gorm:"type:TEXT"`
}
