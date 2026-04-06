package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// queryInt 从 Query 参数获取 int，失败则使用默认值
func queryInt(c *gin.Context, key string, defaultVal int) int {
	val := c.Query(key)
	if val == "" {
		return defaultVal
	}
	n, err := strconv.Atoi(val)
	if err != nil || n <= 0 {
		return defaultVal
	}
	return n
}
