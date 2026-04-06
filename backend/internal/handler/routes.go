package handler

import (
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes 注册所有路由
func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	// ========= 公开接口（无需认证）=========
	public := api.Group("")
	{
		// 认证
		auth := public.Group("/auth")
		{
			auth.POST("/register", register)
			auth.POST("/login", login)
		}

		// 博客（仅已发布）
		blog := public.Group("/blog")
		{
			blog.GET("/list", listPublicBlogs)
			blog.GET("/search", searchBlogs)
			blog.GET("/latest", latestBlogs)
			blog.GET("/detail/:id", getPublicBlog)
			blog.GET("/detail/:id/comments", listComments)
		}

		// 分类（公开只读）
		categories := public.Group("/category")
		{
			categories.GET("/list", listCategories)
			categories.GET("/all", listAllCategoriesHandler)
			categories.GET("/detail/:id", getCategory)
		}

		// 标签（公开只读）
		tags := public.Group("/tag")
		{
			tags.GET("/list", listTags)
			tags.GET("/all", listAllTagsHandler)
			tags.GET("/detail/:id", getTag)
		}

		// 照片墙（公开只读）
		photos := public.Group("/photo")
		{
			photos.GET("/list", listPublicPhotos)
			photos.GET("/all", listAllPublicPhotos)
			photos.GET("/tags", listPublicPhotoTags)
		}
	}

	// ========= 需要登录（任意角色）=========
	authed := api.Group("")
	authed.Use(middleware.JWTAuth())
	{
		// 认证操作
		authedAuth := authed.Group("/auth")
		{
			authedAuth.POST("/logout", logout)
			authedAuth.POST("/refresh", refreshToken)
		}

		// 当前用户
		me := authed.Group("/me")
		{
			me.GET("", getMe)
			me.PUT("", updateMe)
			me.PUT("/password", changePassword)
			me.GET("/blogs", listMyBlogs)         // 我的博客
			me.GET("/favorites", listMyFavorites) // 我的收藏
		}

		// 需登录才能评论、收藏、点赞
		authed.POST("/comments", createComment)
		authed.PUT("/comments/:id", updateComment)
		authed.DELETE("/comments/:id", deleteComment)
		authed.POST("/comments/:id/like", likeComment)

		authed.POST("/blogs/:id/favorite", toggleFavorite)
		authed.POST("/blogs/:id/share", shareBlog)

		// 博客操作（所有登录用户均可）
		authed.POST("/blogs", createBlog)
		authed.PUT("/blogs/:id", updateBlog)
		authed.DELETE("/blogs/:id", deleteBlog)

		// 文件上传
		uploads := authed.Group("/uploads")
		{
			uploads.POST("", uploadFile)
			uploads.GET("", listMyUploads)
		}
	}

	// ========= 管理员专属（admin/root）=========
	adminGroup := api.Group("/admin")
	adminGroup.Use(middleware.JWTAuth(), middleware.RequireRole("admin", "root"))
	{
		// 用户管理
		users := adminGroup.Group("/users")
		{
			users.GET("", adminListUsers)
			users.POST("", adminCreateUser)
			users.GET("/:id", adminGetUser)
			users.PUT("/:id/role", adminUpdateRole)
			users.PUT("/:id/status", adminUpdateStatus)
			users.DELETE("/:id", adminDeleteUser)
		}

		// 博客管理
		blogs := adminGroup.Group("/blogs")
		{
			blogs.GET("/list", adminListAllBlogs)
			blogs.GET("/detail/:id", adminGetBlog)
		}

		// 分类管理（创建/更新/删除）
		categories := adminGroup.Group("/categories")
		{
			categories.POST("", createCategory)
			categories.PUT("/:id", updateCategory)
			categories.DELETE("/:id", deleteCategory)
		}

		// 标签管理
		tags := adminGroup.Group("/tags")
		{
			tags.POST("", createTag)
			tags.PUT("/:id", updateTag)
			tags.DELETE("/:id", deleteTag)
		}

		// 评论管理
		comments := adminGroup.Group("/comments")
		{
			comments.GET("", adminListAllComments)
			comments.DELETE("/:id", deleteComment)
		}

		// 上传文件管理
		adminUploads := adminGroup.Group("/uploads")
		{
			adminUploads.GET("", adminListAllUploads)
			adminUploads.DELETE("/:id", deleteUpload)
		}

		// 照片墙管理
		adminPhotos := adminGroup.Group("/photos")
		{
			adminPhotos.GET("", adminListPhotos)
			adminPhotos.POST("", adminUploadPhoto)
			adminPhotos.PUT("/:id", adminUpdatePhoto)
			adminPhotos.DELETE("/:id", adminDeletePhoto)
		}

		// 照片标签管理
		adminPhotoTags := adminGroup.Group("/photo-tags")
		{
			adminPhotoTags.GET("", adminListPhotoTags)
			adminPhotoTags.GET("/:id", adminGetPhotoTag)
			adminPhotoTags.POST("", adminCreatePhotoTag)
			adminPhotoTags.PUT("/:id", adminUpdatePhotoTag)
			adminPhotoTags.DELETE("/:id", adminDeletePhotoTag)
		}
	}
}
