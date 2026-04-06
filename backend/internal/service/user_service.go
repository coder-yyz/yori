package service

import (
	"errors"

	"backend/internal/model"
	"backend/internal/pkg"
	"backend/internal/repository"
)

// GetProfile 获取当前用户信息
func GetProfile(userID uint) (*model.UserResponse, error) {
	user, err := repository.FindUserByID(userID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}
	resp := user.ToResponse()
	return &resp, nil
}

// UpdateProfile 更新个人信息
func UpdateProfile(userID uint, req *model.UpdateProfileReq) (*model.UserResponse, error) {
	user, err := repository.FindUserByID(userID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	if req.DisplayName != "" {
		user.DisplayName = req.DisplayName
	}
	if req.PhotoURL != "" {
		user.PhotoURL = req.PhotoURL
	}
	if req.PhoneNumber != "" {
		user.PhoneNumber = req.PhoneNumber
	}
	if req.Country != "" {
		user.Country = req.Country
	}
	if req.Address != "" {
		user.Address = req.Address
	}
	if req.State != "" {
		user.State = req.State
	}
	if req.City != "" {
		user.City = req.City
	}
	if req.ZipCode != "" {
		user.ZipCode = req.ZipCode
	}
	if req.About != "" {
		user.About = req.About
	}
	if req.IsPublic != nil {
		user.IsPublic = *req.IsPublic
	}

	if err := repository.UpdateUser(user); err != nil {
		return nil, errors.New("更新失败")
	}
	resp := user.ToResponse()
	return &resp, nil
}

// ChangePassword 修改密码（同时递增 token_version）
func ChangePassword(userID uint, req *model.ChangePasswordReq) error {
	user, err := repository.FindUserByID(userID)
	if err != nil {
		return errors.New("用户不存在")
	}
	if !pkg.CheckPassword(req.OldPassword, user.Password) {
		return errors.New("原密码不正确")
	}
	hashedPwd, err := pkg.HashPassword(req.NewPassword)
	if err != nil {
		return errors.New("密码加密失败")
	}
	user.Password = hashedPwd
	if err := repository.UpdateUser(user); err != nil {
		return errors.New("更新密码失败")
	}
	return repository.IncrTokenVersion(userID)
}

// roleLevel 返回角色等级，数字越大权限越高
func roleLevel(role string) int {
	switch role {
	case model.RoleRoot:
		return 3
	case model.RoleAdmin:
		return 2
	case model.RoleUser:
		return 1
	default:
		return 0
	}
}

// canManage 判断操作者是否有权管理目标用户
// root 可管理所有人（除了自己不能被别人管理）
// admin 只能管理 user
func canManage(callerRole, targetRole string) bool {
	return roleLevel(callerRole) > roleLevel(targetRole)
}

// AdminCreateUser 管理员创建用户
func AdminCreateUser(callerRole string, req *model.AdminCreateUserReq) (*model.UserResponse, error) {
	username := pkg.NormalizeUsername(req.Username)
	if err := pkg.ValidateUsername(username); err != nil {
		return nil, err
	}

	role := req.Role
	if role == "" {
		role = model.RoleUser
	}

	// 权限检查：不能创建权限>=自己的用户（root除外，root可创建admin）
	if callerRole != model.RoleRoot && roleLevel(role) >= roleLevel(callerRole) {
		return nil, errors.New("权限不足，不能创建该角色的用户")
	}
	// admin不能创建root
	if role == model.RoleRoot && callerRole != model.RoleRoot {
		return nil, errors.New("只有root可以创建root用户")
	}

	if _, err := repository.FindUserByUsername(username); err == nil {
		return nil, errors.New("用户名已被注册")
	}

	if req.Email != "" {
		if _, err := repository.FindUserByEmail(req.Email); err == nil {
			return nil, errors.New("邮箱已被注册")
		}
	}

	hashedPwd, err := pkg.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("密码加密失败")
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
		PhotoURL:    req.PhotoURL,
		Role:        role,
		Status:      model.UserStatusActive,
	}

	if err := repository.CreateUser(user); err != nil {
		return nil, errors.New("创建用户失败")
	}

	resp := user.ToResponse()
	return &resp, nil
}

// ListUsers 管理员查询用户列表
func ListUsers(query *model.UserListQuery) ([]model.UserResponse, int64, error) {
	users, total, err := repository.ListUsers(query)
	if err != nil {
		return nil, 0, err
	}
	resp := make([]model.UserResponse, 0, len(users))
	for i := range users {
		resp = append(resp, users[i].ToResponse())
	}
	return resp, total, nil
}

// GetUserByID 管理员根据 UUID 获取指定用户信息
func GetUserByID(uuid string) (*model.UserResponse, error) {
	user, err := repository.FindUserByUUID(uuid)
	if err != nil {
		return nil, errors.New("用户不存在")
	}
	resp := user.ToResponse()
	return &resp, nil
}

// UpdateUserRole 管理员根据 UUID 修改用户角色
func UpdateUserRole(callerRole, callerUUID, targetUUID string, req *model.UpdateUserRoleReq) error {
	if callerUUID == targetUUID {
		return errors.New("不能修改自己的角色")
	}
	user, err := repository.FindUserByUUID(targetUUID)
	if err != nil {
		return errors.New("用户不存在")
	}
	// 权限检查：操作者必须比目标用户权限高
	if !canManage(callerRole, user.Role) {
		return errors.New("权限不足，无法修改该用户")
	}
	// 不能把用户提升到>=自己的级别（root除外）
	if callerRole != model.RoleRoot && roleLevel(req.Role) >= roleLevel(callerRole) {
		return errors.New("权限不足，不能设置该角色")
	}
	// 只有root可以设置root角色
	if req.Role == model.RoleRoot && callerRole != model.RoleRoot {
		return errors.New("只有root可以设置root角色")
	}
	return repository.UpdateUserFields(user.ID, map[string]any{"role": req.Role})
}

// UpdateUserStatus 管理员根据 UUID 修改用户状态
func UpdateUserStatus(callerRole, callerUUID, targetUUID string, req *model.UpdateUserStatusReq) error {
	if callerUUID == targetUUID {
		return errors.New("不能修改自己的状态")
	}
	user, err := repository.FindUserByUUID(targetUUID)
	if err != nil {
		return errors.New("用户不存在")
	}
	if !canManage(callerRole, user.Role) {
		return errors.New("权限不足，无法修改该用户")
	}
	if err := repository.UpdateUserFields(user.ID, map[string]any{"status": req.Status}); err != nil {
		return err
	}
	if req.Status == model.UserStatusBanned {
		_ = repository.IncrTokenVersion(user.ID)
	}
	return nil
}

// DeleteUser 管理员根据 UUID 删除用户
func DeleteUser(callerRole, callerUUID, targetUUID string) error {
	if callerUUID == targetUUID {
		return errors.New("不能删除自己")
	}
	user, err := repository.FindUserByUUID(targetUUID)
	if err != nil {
		return errors.New("用户不存在")
	}
	if !canManage(callerRole, user.Role) {
		return errors.New("权限不足，无法删除该用户")
	}
	if user.Role == model.RoleRoot {
		return errors.New("root用户不能被删除")
	}
	// 级联删除该用户的所有博客
	if err := repository.DeleteBlogsByAuthor(user.ID); err != nil {
		return errors.New("删除用户博客失败")
	}
	return repository.DeleteUser(user.ID)
}
