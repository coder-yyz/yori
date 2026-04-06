package handler

import (
	"backend/internal/model"
	"backend/internal/pkg"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

// @Summary      用户注册
// @Description  注册新用户，返回用户信息
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body      model.RegisterReq  true  "注册信息"
// @Success      200   {object}  pkg.Response{data=model.UserResponse}
// @Failure      400   {object}  pkg.Response
// @Router       /auth/register [post]
func register(c *gin.Context) {
	var req model.RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	token, user, err := service.Register(&req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, gin.H{"token": token, "user": user})
}

// @Summary      用户登录
// @Description  账号密码登录，返回 JWT Token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body      model.LoginReq  true  "登录信息"
// @Success      200   {object}  pkg.Response{data=map[string]any}
// @Failure      400   {object}  pkg.Response
// @Router       /auth/login [post]
func login(c *gin.Context) {
	var req model.LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	token, err := service.Login(&req)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, gin.H{"token": token})
}

// @Summary      登出
// @Description  使当前 Token 失效（递增 token_version）
// @Tags         auth
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  pkg.Response
// @Failure      401  {object}  pkg.Response
// @Router       /auth/logout [post]
func logout(c *gin.Context) {
	uid := c.GetUint("user_id")
	if err := service.Logout(uid); err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, "已成功登出")
}

// @Summary      刷新 Token
// @Description  使用当前有效 Token 换取新 Token
// @Tags         auth
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  pkg.Response{data=map[string]any}
// @Failure      401  {object}  pkg.Response
// @Router       /auth/refresh [post]
func refreshToken(c *gin.Context) {
	uid := c.GetUint("user_id")
	token, err := service.RefreshToken(uid)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, gin.H{"token": token})
}
