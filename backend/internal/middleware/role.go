package middleware

import (
	"backend/internal/pkg"

	"github.com/gin-gonic/gin"
)

// RequireRole 角色权限中间件，传入允许的角色列表
func RequireRole(roles ...string) gin.HandlerFunc {
	allowedRoles := make(map[string]bool, len(roles))
	for _, r := range roles {
		allowedRoles[r] = true
	}
	return func(c *gin.Context) {
		role := c.GetString("role")
		if !allowedRoles[role] {
			pkg.Forbidden(c, "权限不足")
			return
		}
		c.Next()
	}
}
