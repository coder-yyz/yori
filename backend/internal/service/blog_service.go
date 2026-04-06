package service

import (
	"errors"

	"backend/internal/model"
	"backend/internal/repository"
)

// CreateBlog 创建博客，TagUUIDs/CategoryUUIDs 解析为内部整数 ID
func CreateBlog(authorID uint, req *model.CreateBlogReq) (*model.Blog, error) {
	status := req.Status
	if status == "" {
		status = model.BlogStatusDraft
	}

	// 解析 TagUUIDs → tagIDs
	tagIDs := make([]uint, 0, len(req.TagUUIDs))
	for _, uuid := range req.TagUUIDs {
		tag, err := repository.GetTagByUUID(uuid)
		if err != nil {
			return nil, errors.New("标签不存在: " + uuid)
		}
		tagIDs = append(tagIDs, tag.ID)
	}

	// 解析 CategoryUUIDs → categoryIDs
	catIDs := make([]uint, 0, len(req.CategoryUUIDs))
	for _, uuid := range req.CategoryUUIDs {
		cat, err := repository.GetCategoryByUUID(uuid)
		if err != nil {
			return nil, errors.New("分类不存在: " + uuid)
		}
		catIDs = append(catIDs, cat.ID)
	}

	contentType := req.ContentType
	if contentType == "" {
		contentType = model.ContentTypeMarkdown
	}

	blog := &model.Blog{
		Title:           req.Title,
		Content:         req.Content,
		ContentType:     contentType,
		Description:     req.Description,
		CoverURL:        req.CoverURL,
		Status:          status,
		AuthorID:        authorID,
		MetaTitle:       req.MetaTitle,
		MetaDescription: req.MetaDescription,
		MetaKeywords:    req.MetaKeywords,
	}

	if err := repository.CreateBlog(blog, tagIDs, catIDs); err != nil {
		return nil, errors.New("创建博客失败")
	}

	result, err := repository.GetBlogByID(blog.ID)
	if err != nil {
		return blog, nil
	}
	return result, nil
}

// GetBlog 根据 UUID 获取博客详情（同时递增浏览量）
func GetBlog(uuid string, isPublicAccess bool) (*model.Blog, error) {
	blog, err := repository.GetBlogByUUID(uuid)
	if err != nil {
		return nil, errors.New("博客不存在")
	}
	if isPublicAccess && blog.Status != model.BlogStatusPublished {
		return nil, errors.New("博客不存在")
	}
	go func() { _ = repository.IncrBlogViews(blog.ID) }()
	return blog, nil
}

// UpdateBlog 根据 UUID 更新博客（只有作者或管理员可操作）
func UpdateBlog(uuid string, operatorID uint, role string, req *model.UpdateBlogReq) (*model.Blog, error) {
	blog, err := repository.GetBlogByUUID(uuid)
	if err != nil {
		return nil, errors.New("博客不存在")
	}
	if role != model.RoleAdmin && blog.AuthorID != operatorID {
		return nil, errors.New("无权限修改此博客")
	}

	if req.Title != "" {
		blog.Title = req.Title
	}
	if req.Content != "" {
		blog.Content = req.Content
	}
	if req.Description != "" {
		blog.Description = req.Description
	}
	if req.CoverURL != "" {
		blog.CoverURL = req.CoverURL
	}
	if req.Status != "" {
		blog.Status = req.Status
	}
	if req.MetaTitle != "" {
		blog.MetaTitle = req.MetaTitle
	}
	if req.MetaDescription != "" {
		blog.MetaDescription = req.MetaDescription
	}
	if req.MetaKeywords != "" {
		blog.MetaKeywords = req.MetaKeywords
	}
	if req.ContentType != "" {
		blog.ContentType = req.ContentType
	}

	// 解析 TagUUIDs / CategoryUUIDs
	tagIDs := make([]uint, 0, len(req.TagUUIDs))
	for _, u := range req.TagUUIDs {
		tag, err := repository.GetTagByUUID(u)
		if err != nil {
			return nil, errors.New("标签不存在: " + u)
		}
		tagIDs = append(tagIDs, tag.ID)
	}
	catIDs := make([]uint, 0, len(req.CategoryUUIDs))
	for _, u := range req.CategoryUUIDs {
		cat, err := repository.GetCategoryByUUID(u)
		if err != nil {
			return nil, errors.New("分类不存在: " + u)
		}
		catIDs = append(catIDs, cat.ID)
	}

	if err := repository.UpdateBlog(blog, tagIDs, catIDs); err != nil {
		return nil, errors.New("更新博客失败")
	}
	return repository.GetBlogByID(blog.ID)
}

// DeleteBlog 根据 UUID 删除博客（只有作者或管理员可操作）
func DeleteBlog(uuid string, operatorID uint, role string) error {
	blog, err := repository.GetBlogByUUID(uuid)
	if err != nil {
		return errors.New("博客不存在")
	}
	if role != model.RoleAdmin && blog.AuthorID != operatorID {
		return errors.New("无权限删除此博客")
	}
	return repository.DeleteBlog(blog.ID)
}

// ListPublicBlogs 查询已发布博客列表（公开）
func ListPublicBlogs(query *model.BlogListQuery) ([]model.Blog, int64, error) {
	resolveBlogQueryUUIDs(query)
	return repository.ListBlogs(query, true)
}

// ListAllBlogs 查询所有博客列表（管理员）
func ListAllBlogs(query *model.BlogListQuery) ([]model.Blog, int64, error) {
	resolveBlogQueryUUIDs(query)
	return repository.ListBlogs(query, false)
}

// ListMyBlogs 查询自己的博客列表（作者）
func ListMyBlogs(authorID uint, query *model.BlogListQuery) ([]model.Blog, int64, error) {
	query.AuthorID = authorID
	resolveBlogQueryUUIDs(query)
	return repository.ListBlogs(query, false)
}

// ToggleFavorite 收藏/取消收藏博客（按 UUID）
func ToggleFavorite(userID uint, blogUUID string) (bool, error) {
	blog, err := repository.GetBlogByUUID(blogUUID)
	if err != nil {
		return false, errors.New("博客不存在")
	}
	return repository.ToggleFavorite(userID, blog.ID)
}

// ShareBlog 分享博客（按 UUID）
func ShareBlog(blogUUID string, userID uint, ip string) error {
	blog, err := repository.GetBlogByUUID(blogUUID)
	if err != nil {
		return errors.New("博客不存在")
	}
	return repository.RecordShare(blog.ID, userID, ip)
}

// ListMyFavorites 获取用户收藏的博客列表
func ListMyFavorites(userID uint, page, pageSize int) ([]model.Blog, int64, error) {
	return repository.ListFavoritesByUser(userID, page, pageSize)
}

// resolveBlogQueryUUIDs 将 BlogListQuery 中的 UUID 字段解析为内部整数 ID
func resolveBlogQueryUUIDs(query *model.BlogListQuery) {
	if query.CategoryUUID != "" {
		if cat, err := repository.GetCategoryByUUID(query.CategoryUUID); err == nil {
			query.CategoryID = cat.ID
		}
	}
	if query.TagUUID != "" {
		if tag, err := repository.GetTagByUUID(query.TagUUID); err == nil {
			query.TagID = tag.ID
		}
	}
}
