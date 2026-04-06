package model

// 角色常量
const (
	RoleRoot  = "root" // 超级管理员
	RoleAdmin = "admin"
	RoleUser  = "user"
)

// 用户状态常量
const (
	UserStatusActive = "active"
	UserStatusBanned = "banned"
)

// User 用户模型
type User struct {
	BaseModel
	Username     string `json:"username" gorm:"uniqueIndex;size:64;not null"`
	Email        string `json:"email" gorm:"uniqueIndex;size:128"`
	Password     string `json:"-" gorm:"not null"`
	DisplayName  string `json:"displayName" gorm:"size:128"`
	PhotoURL     string `json:"photoURL" gorm:"size:512"`
	PhoneNumber  string `json:"phoneNumber" gorm:"size:32"`
	Country      string `json:"country" gorm:"size:64"`
	Address      string `json:"address" gorm:"size:256"`
	State        string `json:"state" gorm:"size:64"`
	City         string `json:"city" gorm:"size:64"`
	ZipCode      string `json:"zipCode" gorm:"size:16"`
	About        string `json:"about" gorm:"type:text"`
	Role         string `json:"role" gorm:"size:16;default:'user'"`     // admin, author, user
	IsPublic     bool   `json:"isPublic" gorm:"default:true"`
	Status       string `json:"status" gorm:"size:16;default:'active'"` // active, banned, pending
	TokenVersion int    `json:"-" gorm:"default:0"`                     // 用于 JWT 失效
}

// UserResponse 用户响应（隐藏敏感字段）
type UserResponse struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	DisplayName string `json:"displayName"`
	PhotoURL    string `json:"photoURL"`
	PhoneNumber string `json:"phoneNumber"`
	Country     string `json:"country"`
	Address     string `json:"address"`
	State       string `json:"state"`
	City        string `json:"city"`
	ZipCode     string `json:"zipCode"`
	About       string `json:"about"`
	Role        string `json:"role"`
	IsPublic    bool   `json:"isPublic"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
}

// ToResponse 转换为响应对象
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:          u.UUID,
		Username:    u.Username,
		Email:       u.Email,
		DisplayName: u.DisplayName,
		PhotoURL:    u.PhotoURL,
		PhoneNumber: u.PhoneNumber,
		Country:     u.Country,
		Address:     u.Address,
		State:       u.State,
		City:        u.City,
		ZipCode:     u.ZipCode,
		About:       u.About,
		Role:        u.Role,
		IsPublic:    u.IsPublic,
		Status:      u.Status,
		CreatedAt:   u.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// UserBrief 用于关联查询的轻量用户信息（由 Repository 层手动组装）
type UserBrief struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	PhotoURL    string `json:"photoURL"`
}

// ToBrief 转换为精简用户信息
func (u *User) ToBrief() UserBrief {
	return UserBrief{
		ID:          u.UUID,
		Username:    u.Username,
		DisplayName: u.DisplayName,
		PhotoURL:    u.PhotoURL,
	}
}

// ---- Request DTOs ----

type RegisterReq struct {
	Username    string `json:"username" binding:"required,min=3,max=32,alphanum"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6,max=64"`
	DisplayName string `json:"displayName" binding:"omitempty,max=64"`
}

type LoginReq struct {
	Account  string `json:"account" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UpdateProfileReq struct {
	DisplayName string `json:"displayName" binding:"omitempty,max=64"`
	PhotoURL    string `json:"photoURL" binding:"omitempty,max=512"`
	PhoneNumber string `json:"phoneNumber" binding:"omitempty,max=32"`
	Country     string `json:"country" binding:"omitempty,max=64"`
	Address     string `json:"address" binding:"omitempty,max=256"`
	State       string `json:"state" binding:"omitempty,max=64"`
	City        string `json:"city" binding:"omitempty,max=64"`
	ZipCode     string `json:"zipCode" binding:"omitempty,max=16"`
	About       string `json:"about" binding:"omitempty,max=500"`
	IsPublic    *bool  `json:"isPublic"`
}

type ChangePasswordReq struct {
	OldPassword string `json:"oldPassword" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6,max=64"`
}

type UpdateUserRoleReq struct {
	Role string `json:"role" binding:"required,oneof=root admin user"`
}

type UpdateUserStatusReq struct {
	Status string `json:"status" binding:"required,oneof=active banned pending"`
}

type AdminCreateUserReq struct {
	Username    string `json:"username" binding:"required,min=3,max=32,alphanum"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6,max=64"`
	DisplayName string `json:"displayName" binding:"omitempty,max=64"`
	PhotoURL    string `json:"photoURL" binding:"omitempty,max=512"`
	Role        string `json:"role" binding:"omitempty,oneof=root admin user"`
}

type UserListQuery struct {
	Page     int    `form:"page,default=1" binding:"min=1"`
	PageSize int    `form:"pageSize,default=10" binding:"min=1,max=100"`
	Role     string `form:"role" binding:"omitempty,oneof=root admin user"`
	Status   string `form:"status" binding:"omitempty,oneof=active banned pending"`
	Search   string `form:"search"`
}
