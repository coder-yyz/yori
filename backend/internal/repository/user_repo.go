package repository

import (
	"backend/internal/model"
	"backend/internal/pkg"

	"gorm.io/gorm"
)

// FindUserByID 根据内部 ID 查询用户
func FindUserByID(id uint) (*model.User, error) {
	var u model.User
	err := DB.First(&u, id).Error
	return &u, err
}

// FindUserByUUID 根据 UUID 查询用户
func FindUserByUUID(uuid string) (*model.User, error) {
	var u model.User
	err := DB.Where("uuid = ?", uuid).First(&u).Error
	return &u, err
}

// FindUserByUsername 根据用户名查询用户
func FindUserByUsername(username string) (*model.User, error) {
	var u model.User
	err := DB.Where("username = ?", pkg.NormalizeUsername(username)).First(&u).Error
	return &u, err
}

// FindUserByEmail 根据邮箱查询用户
func FindUserByEmail(email string) (*model.User, error) {
	var u model.User
	err := DB.Where("email = ?", email).First(&u).Error
	return &u, err
}

// CreateUser 创建用户
func CreateUser(u *model.User) error {
	u.Username = pkg.NormalizeUsername(u.Username)
	return DB.Create(u).Error
}

// UpdateUser 更新用户
func UpdateUser(u *model.User) error {
	return DB.Save(u).Error
}

// UpdateUserFields 更新用户指定字段
func UpdateUserFields(id uint, fields map[string]any) error {
	return DB.Model(&model.User{}).Where("id = ?", id).Updates(fields).Error
}

// IncrTokenVersion 递增 token_version，使旧 token 失效（登出）
func IncrTokenVersion(id uint) error {
	return DB.Model(&model.User{}).Where("id = ?", id).
		UpdateColumn("token_version", gorm.Expr("token_version + 1")).Error
}

// ListUsers 分页查询用户列表
func ListUsers(query *model.UserListQuery) ([]model.User, int64, error) {
	db := DB.Model(&model.User{})
	if query.Role != "" {
		db = db.Where("role = ?", query.Role)
	}
	if query.Status != "" {
		db = db.Where("status = ?", query.Status)
	}
	if query.Search != "" {
		like := "%" + query.Search + "%"
		db = db.Where("username LIKE ? OR display_name LIKE ? OR email LIKE ?", like, like, like)
	}
	var total int64
	db.Count(&total)
	var users []model.User
	err := db.Offset(pkg.Offset(query.Page, query.PageSize)).Limit(query.PageSize).
		Order("created_at DESC").Find(&users).Error
	return users, total, err
}

// DeleteUser 软删除用户
func DeleteUser(id uint) error {
	return DB.Delete(&model.User{}, id).Error
}
