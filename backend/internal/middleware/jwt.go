package middleware

import (
	"strings"

	"backend/internal/pkg"
	"backend/internal/repository"

	"github.com/gin-gonic/gin"
)

// JWTAuth JWT 鉴权中间件，验证 token 并注入 user_id、role 到上下文
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			pkg.Unauthorized(c, "请先登录")
			return
		}
		tokenStr := strings.TrimPrefix(auth, "Bearer ")

		claims, err := pkg.ParseToken(tokenStr)
		if err != nil {
			pkg.Unauthorized(c, "Token 无效或已过期，请重新登录")
			return
		}

		// 验证 token_version，防止已登出/被封禁的 Token 继续有效
		user, err := repository.FindUserByID(claims.UserID)
		if err != nil {
			pkg.Unauthorized(c, "用户不存在")
			return
		}
		if user.TokenVersion != claims.TokenVersion {
			pkg.Unauthorized(c, "Token 已失效，请重新登录")
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Set("user_uuid", user.UUID)
		c.Next()
	}
}
