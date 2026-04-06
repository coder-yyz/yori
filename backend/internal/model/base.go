package model

import (
	"crypto/rand"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// BaseModel 替代 gorm.Model，修复 GORM v1.25.x + SQLite 的重复 PRIMARY KEY DDL bug。
//
// ID (uint)  — 内部自增主键，隐藏于 JSON，仅用于数据库 JOIN / 外键引用。
// UUID (string) — 对外暴露的唯一 ID（随机 UUID v4），JSON 字段名为 "id"。
type BaseModel struct {
	ID        uint           `json:"-"                   gorm:"column:id;primaryKey;autoIncrement:false"`
	UUID      string         `json:"id"                  gorm:"uniqueIndex;size:36;not null"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index" swaggertype:"string" format:"date-time"`
}

// BeforeCreate 在每次插入前：
//   - 分配内部自增 ID（避免 GORM 对 autoIncrement:false 字段传 0 的 Bug）
//   - 生成 UUID v4 作为对外标识
func (b *BaseModel) BeforeCreate(tx *gorm.DB) error {
	if b.ID == 0 {
		table := tx.Statement.Table
		if table == "" && tx.Statement.Schema != nil {
			table = tx.Statement.Schema.Table
		}
		if table != "" {
			var maxID uint
			tx.Raw("SELECT COALESCE(MAX(id), 0) + 1 FROM `" + table + "`").Scan(&maxID)
			b.ID = maxID
		}
	}
	if b.UUID == "" {
		b.UUID = newUUID()
	}
	return nil
}

// newUUID 生成随机 UUID v4（格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx）
func newUUID() string {
	return NewPublicUUID()
}

// NewPublicUUID 生成随机 UUID v4（供外部包使用）
func NewPublicUUID() string {
	var u [16]byte
	if _, err := rand.Read(u[:]); err != nil {
		panic("uuid: crypto/rand read failed: " + err.Error())
	}
	u[6] = (u[6] & 0x0f) | 0x40 // version 4
	u[8] = (u[8] & 0x3f) | 0x80 // variant bits
	return fmt.Sprintf("%x-%x-%x-%x-%x", u[0:4], u[4:6], u[6:8], u[8:10], u[10:])
}
