package main

import (
	"log"
	"os"

	"backend/config"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/service"
	_ "backend/docs" // swag generated docs

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           个人博客 API
// @version         1.0
// @description     基于 Gin + GORM + SQLite 的个人博客后端接口文档
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@example.com

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      localhost:8080
// @BasePath  /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description 格式: Bearer {token}

func main() {
	// 加载配置
	config.Init()

	// 初始化数据库
	repository.InitDB()

	// 检查并初始化超级管理员
	service.InitSuperAdmin()

	// 设置 Gin 模式
	gin.SetMode(config.Conf.Server.Mode)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Cors())
	r.Use(middleware.RequestLogger())

	// Swagger UI: http://localhost:8080/swagger/index.html
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// 确保上传目录存在
	if err := os.MkdirAll("uploads", 0750); err != nil {
		log.Fatalf("创建上传目录失败: %v", err)
	}
	// 静态文件服务：/uploads/* → ./uploads/
	r.Static("/uploads", "./uploads")

	// 注册所有路由
	handler.RegisterRoutes(r)

	addr := ":" + config.Conf.Server.Port
	log.Printf("服务器启动，监听端口 %s", addr)
	log.Printf("Swagger 文档: http://localhost%s/swagger/index.html", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}

