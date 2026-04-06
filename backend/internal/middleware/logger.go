package middleware

import (
	"github.com/gin-gonic/gin"
	"log"
	"time"
)

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()
		c.Next()
		log.Printf("[%s] %s | %d | %s", c.Request.Method, c.Request.URL, c.Writer.Status(), time.Since(t))
	}
}
