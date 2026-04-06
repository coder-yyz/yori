package handler

import (
	"backend/internal/model"
	"backend/internal/pkg"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// @Summary      获取当前用户信息
// @Tags         users
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  pkg.Response{data=model.UserResponse}
// @Failure      401  {object}  pkg.Response
// @Router       /me [get]
func getMe(c *gin.Context) {
	uid := c.GetUint("user_id")
	user, err := service.GetProfile(uid)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, user)
}

// @Summary      更新当前用户信息
// @Tags         users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      model.UpdateProfileReq  true  "更新信息"
// @Success      200   {object}  pkg.Response{data=model.UserResponse}
// @Failure      400   {object}  pkg.Response
// @Router       /me [put]
func updateMe(c *gin.Context) {
	var req model.UpdateProfileReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	uid := c.GetUint("user_id")
	user, err := service.UpdateProfile(uid, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, user)
}

// @Summary      修改密码
// @Description  修改成功后需重新登录
// @Tags         users
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body      model.ChangePasswordReq  true  "密码信息"
// @Success      200   {object}  pkg.Response
// @Failure      400   {object}  pkg.Response
// @Router       /me/password [put]
func changePassword(c *gin.Context) {
	var req model.ChangePasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	uid := c.GetUint("user_id")
	if err := service.ChangePassword(uid, &req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "密码修改成功，请重新登录")
}

// ---- 管理员接口 ----

// adminCreateUser 管理员创建用户
func adminCreateUser(c *gin.Context) {
	var req model.AdminCreateUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	callerRole := c.GetString("role")
	user, err := service.AdminCreateUser(callerRole, &req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, user)
}

// @Summary      用户列表（管理员）
// @Tags         admin
// @Produce      json
// @Security     BearerAuth
// @Param        page      query  int     false  "页码"
// @Param        pageSize  query  int     false  "每页数量"
// @Param        search    query  string  false  "搜索关键词"
// @Param        role      query  string  false  "角色筛选"
// @Param        status    query  string  false  "状态筛选"
// @Success      200  {object}  pkg.PageResponse
// @Failure      403  {object}  pkg.Response
// @Router       /admin/users [get]
func adminListUsers(c *gin.Context) {
	var query model.UserListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 10
	}
	users, total, err := service.ListUsers(&query)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.PageSuccess(c, users, total, query.Page, query.PageSize)
}

// @Summary      获取指定用户（管理员）
// @Tags         admin
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "用户UUID"
// @Success      200  {object}  pkg.Response{data=model.UserResponse}
// @Failure      404  {object}  pkg.Response
// @Router       /admin/users/{id} [get]
func adminGetUser(c *gin.Context) {
	uuid := parseUUID(c)
	user, err := service.GetUserByID(uuid)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, user)
}

// adminUpdateRole 管理员修改用户角色
func adminUpdateRole(c *gin.Context) {
	uuid := parseUUID(c)
	callerRole := c.GetString("role")
	callerUUID := c.GetString("user_uuid")
	var req model.UpdateUserRoleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	if err := service.UpdateUserRole(callerRole, callerUUID, uuid, &req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "角色更新成功")
}

// adminUpdateStatus 管理员修改用户状态
func adminUpdateStatus(c *gin.Context) {
	uuid := parseUUID(c)
	callerRole := c.GetString("role")
	callerUUID := c.GetString("user_uuid")
	var req model.UpdateUserStatusReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	if err := service.UpdateUserStatus(callerRole, callerUUID, uuid, &req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "状态更新成功")
}

// adminDeleteUser 管理员删除用户
func adminDeleteUser(c *gin.Context) {
	uuid := parseUUID(c)
	callerRole := c.GetString("role")
	callerUUID := c.GetString("user_uuid")
	if err := service.DeleteUser(callerRole, callerUUID, uuid); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "用户已删除")
}

// parseUUID 从路由参数中获取 UUID 字符串
func parseUUID(c *gin.Context) string {
	return c.Param("id")
}
