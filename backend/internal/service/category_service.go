package service

import (
	"errors"
	"strings"

	"backend/internal/model"
	"backend/internal/repository"
)

// CreateCategory 创建分类
func CreateCategory(req *model.CreateCategoryReq) (*model.Category, error) {
	if _, err := repository.GetCategoryByName(req.Name); err == nil {
		return nil, errors.New("分类名称已存在")
	}

	slug := req.Slug
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
	}
	// 检查 slug 唯一性
	if _, err := repository.GetCategoryBySlug(slug); err == nil {
		return nil, errors.New("slug 已存在，请手动指定唯一的 slug")
	}

	c := &model.Category{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		CoverURL:    req.CoverURL,
		ParentID:    req.ParentID,
	}
	if err := repository.CreateCategory(c); err != nil {
		return nil, errors.New("创建分类失败")
	}
	return c, nil
}

// GetCategory 获取分类详情
func GetCategory(uuid string) (*model.Category, error) {
	c, err := repository.GetCategoryByUUID(uuid)
	if err != nil {
		return nil, errors.New("分类不存在")
	}
	return c, nil
}

// UpdateCategory 更新分类
func UpdateCategory(uuid string, req *model.UpdateCategoryReq) (*model.Category, error) {
	c, err := repository.GetCategoryByUUID(uuid)
	if err != nil {
		return nil, errors.New("分类不存在")
	}

	if req.Name != "" {
		c.Name = req.Name
	}
	if req.Slug != "" {
		c.Slug = req.Slug
	}
	if req.Description != "" {
		c.Description = req.Description
	}
	if req.CoverURL != "" {
		c.CoverURL = req.CoverURL
	}
	c.ParentID = req.ParentID

	if err := repository.UpdateCategory(c); err != nil {
		return nil, errors.New("更新分类失败")
	}
	return c, nil
}

// DeleteCategory 删除分类
func DeleteCategory(uuid string) error {
	c, err := repository.GetCategoryByUUID(uuid)
	if err != nil {
		return errors.New("分类不存在")
	}
	// 先清除博客与该分类的关联
	if err := repository.RemoveCategoryFromAllBlogs(c.ID); err != nil {
		return errors.New("清除分类关联失败")
	}
	return repository.DeleteCategory(c.ID)
}

// ListCategories 查询分类列表
func ListCategories(page, pageSize int) ([]model.Category, int64, error) {
	return repository.ListCategories(page, pageSize)
}

// ListAllCategories 获取所有分类
func ListAllCategories() ([]model.Category, error) {
	return repository.ListAllCategories()
}
