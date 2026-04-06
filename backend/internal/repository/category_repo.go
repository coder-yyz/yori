package repository

import (
	"backend/internal/model"
	"backend/internal/pkg"
)

// loadCategoryChildren 批量填充 categories 的 Children 字段
func loadCategoryChildren(categories []model.Category) []model.Category {
	if len(categories) == 0 {
		return categories
	}
	ids := make([]uint, 0, len(categories))
	for _, c := range categories {
		ids = append(ids, c.ID)
	}
	var children []model.Category
	DB.Where("parent_id IN ?", ids).Find(&children)
	childMap := make(map[uint][]model.Category)
	for _, ch := range children {
		if ch.ParentID != nil {
			childMap[*ch.ParentID] = append(childMap[*ch.ParentID], ch)
		}
	}
	for i := range categories {
		categories[i].Children = childMap[categories[i].ID]
	}
	return categories
}

// CreateCategory 创建分类
func CreateCategory(c *model.Category) error {
	return DB.Create(c).Error
}

// GetCategoryByID 根据 ID 获取分类（含子分类）
func GetCategoryByID(id uint) (*model.Category, error) {
	var c model.Category
	if err := DB.First(&c, id).Error; err != nil {
		return nil, err
	}
	result := loadCategoryChildren([]model.Category{c})
	return &result[0], nil
}

// GetCategoryByUUID 根据 UUID 获取分类
func GetCategoryByUUID(uuid string) (*model.Category, error) {
	var c model.Category
	if err := DB.Where("uuid = ?", uuid).First(&c).Error; err != nil {
		return nil, err
	}
	result := loadCategoryChildren([]model.Category{c})
	return &result[0], nil
}

// GetCategoryByName 根据名称查询分类
func GetCategoryByName(name string) (*model.Category, error) {
	var c model.Category
	err := DB.Where("name = ?", name).First(&c).Error
	return &c, err
}

// GetCategoryBySlug 根据 slug 查询分类
func GetCategoryBySlug(slug string) (*model.Category, error) {
	var c model.Category
	err := DB.Where("slug = ?", slug).First(&c).Error
	return &c, err
}

// UpdateCategory 更新分类
func UpdateCategory(c *model.Category) error {
	return DB.Save(c).Error
}

// DeleteCategory 软删除分类
func DeleteCategory(id uint) error {
	return DB.Delete(&model.Category{}, id).Error
}

// RemoveCategoryFromAllBlogs 删除关联表中该分类的所有记录
func RemoveCategoryFromAllBlogs(categoryID uint) error {
	return DB.Where("category_id = ?", categoryID).Delete(&model.BlogCategory{}).Error
}

// ListCategories 查询顶级分类列表（手动加载子分类）
func ListCategories(page, pageSize int) ([]model.Category, int64, error) {
	var total int64
	DB.Model(&model.Category{}).Where("parent_id IS NULL").Count(&total)

	var categories []model.Category
	err := DB.Where("parent_id IS NULL").
		Offset(pkg.Offset(page, pageSize)).Limit(pageSize).
		Order("created_at DESC").Find(&categories).Error
	if err != nil {
		return nil, 0, err
	}

	categories = loadCategoryChildren(categories)

	// 填充帖子数量
	for i := range categories {
		DB.Table("blog_categories").Where("category_id = ?", categories[i].ID).Count(&categories[i].BlogCount)
	}
	return categories, total, nil
}

// ListAllCategories 获取所有分类（不分页，用于下拉选择）
func ListAllCategories() ([]model.Category, error) {
	var categories []model.Category
	err := DB.Order("name ASC").Find(&categories).Error
	return categories, err
}

