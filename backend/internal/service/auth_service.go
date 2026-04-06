package service

import (
	"errors"
	"log"
	"strings"

	"backend/internal/model"
	"backend/internal/pkg"
	"backend/internal/repository"
)

// InitSuperAdmin 检查是否存在超级管理员，没有则自动创建
func InitSuperAdmin() {
	var count int64
	repository.DB.Model(&model.User{}).Where("role = ?", model.RoleRoot).Count(&count)
	if count > 0 {
		return
	}

	hashedPwd, err := pkg.HashPassword("SuperAdmin@password")
	if err != nil {
		panic("初始化超级管理员失败: 密码加密出错")
	}

	user := &model.User{
		Username:    "SuperAdmin",
		Email:       "admin@example.com",
		Password:    hashedPwd,
		DisplayName: "SuperAdmin",
		Role:        model.RoleRoot,
		Status:      model.UserStatusActive,
	}
	if err := repository.CreateUser(user); err != nil {
		panic("初始化超级管理员失败: " + err.Error())
	}
	log.Println("已自动创建超级管理员: SuperAdmin")
}

// Register 注册新用户
func Register(req *model.RegisterReq) (string, *model.UserResponse, error) {
	// 规范化用户名
	username := pkg.NormalizeUsername(req.Username)
	if err := pkg.ValidateUsername(username); err != nil {
		return "", nil, err
	}

	// 检查用户名是否已存在
	if _, err := repository.FindUserByUsername(username); err == nil {
		return "", nil, errors.New("用户名已被注册")
	}

	// 检查邮箱是否已存在
	if req.Email != "" {
		if _, err := repository.FindUserByEmail(req.Email); err == nil {
			return "", nil, errors.New("邮箱已被注册")
		}
	}

	hashedPwd, err := pkg.HashPassword(req.Password)
	if err != nil {
		return "", nil, errors.New("密码加密失败")
	}

	displayName := req.DisplayName
	if displayName == "" {
		displayName = username
	}

	user := &model.User{
		Username:    username,
		Email:       req.Email,
		Password:    hashedPwd,
		DisplayName: displayName,
		Role:        model.RoleUser,
		Status:      model.UserStatusActive,
	}

	if err := repository.CreateUser(user); err != nil {
		return "", nil, errors.New("注册失败，请稍后再试")
	}

	token, err := pkg.GenerateToken(user.ID, user.Role, user.TokenVersion)
	if err != nil {
		return "", nil, errors.New("生成 Token 失败")
	}

	resp := user.ToResponse()
	return token, &resp, nil
}

// Login 用户登录（支持用户名或邮箱），返回 JWT Token
func Login(req *model.LoginReq) (string, error) {
	var user *model.User
	var err error

	if strings.Contains(req.Account, "@") {
		user, err = repository.FindUserByEmail(req.Account)
	} else {
		user, err = repository.FindUserByUsername(req.Account)
	}
	if err != nil {
		return "", errors.New("用户名或密码错误")
	}

	if !pkg.CheckPassword(req.Password, user.Password) {
		return "", errors.New("用户名或密码错误")
	}

	if user.Status == model.UserStatusBanned {
		return "", errors.New("账号已被封禁，请联系管理员")
	}

	token, err := pkg.GenerateToken(user.ID, user.Role, user.TokenVersion)
	if err != nil {
		return "", errors.New("生成 Token 失败")
	}

	return token, nil
}

// Logout 登出（递增 token_version 使旧 Token 失效）
func Logout(userID uint) error {
	return repository.IncrTokenVersion(userID)
}

// RefreshToken 刷新 Token
func RefreshToken(userID uint) (string, error) {
	user, err := repository.FindUserByID(userID)
	if err != nil {
		return "", errors.New("用户不存在")
	}
	if user.Status == model.UserStatusBanned {
		return "", errors.New("账号已被封禁")
	}
	return pkg.GenerateToken(user.ID, user.Role, user.TokenVersion)
}
