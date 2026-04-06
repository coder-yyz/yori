# Go Gin 标准项目模板（Go 官方命名规范）

## 命名规范
- 文件：全小写 + 短横线 → user_handler.go
- 包名：全小写 → package handler
- 结构体/函数：大驼峰 → UserService

## 功能清单
- Gin + GORM + SQLite
- Redis 集成
- JWT 鉴权
- CORS 跨域
- Viper 多环境配置
- Swagger 文档
- 三层架构

## 启动命令
开发环境：
go mod tidy
go run cmd/server/main.go

生产环境：
export GO_ENV=prod
go run cmd/server/main.go

## 访问地址
- 服务：http://localhost:8080
- 文档：http://localhost:8080/swagger/index.html
