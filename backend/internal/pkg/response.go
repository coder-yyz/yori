package pkg

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response Swagger 文档用响应结构体
type Response struct {
	Code int    `json:"code" example:"0"`
	Msg  string `json:"msg"  example:"success"`
	Data any    `json:"data"`
}

// PageResponse Swagger 文档用分页响应结构体
type PageResponse struct {
	Code int        `json:"code" example:"0"`
	Msg  string     `json:"msg"  example:"success"`
	Data PageResult `json:"data"`
}

// PageResult 分页响应结构
type PageResult struct {
	List     any   `json:"list"`
	Total    int64 `json:"total"`
	Page     int   `json:"page"`
	PageSize int   `json:"pageSize"`
}

// respond 内部通用响应函数
func respond(c *gin.Context, code int, msg string, data any) {
	c.JSON(http.StatusOK, gin.H{
		"code": code,
		"msg":  msg,
		"data": data,
	})
}

// Success 成功响应
func Success(c *gin.Context, data any) {
	respond(c, 0, "success", data)
}

// Fail 失败响应（业务错误）
func Fail(c *gin.Context, msg string) {
	respond(c, -1, msg, nil)
}

// Unauthorized 未授权响应
func Unauthorized(c *gin.Context, msg string) {
	c.JSON(http.StatusUnauthorized, gin.H{
		"code": 401,
		"msg":  msg,
		"data": nil,
	})
	c.Abort()
}

// Forbidden 无权限响应
func Forbidden(c *gin.Context, msg string) {
	c.JSON(http.StatusForbidden, gin.H{
		"code": 403,
		"msg":  msg,
		"data": nil,
	})
	c.Abort()
}

// PageSuccess 分页成功响应
func PageSuccess(c *gin.Context, list any, total int64, page, pageSize int) {
	Success(c, PageResult{
		List:     list,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}
