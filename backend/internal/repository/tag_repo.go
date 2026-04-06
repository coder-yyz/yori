package repository

import (
	"backend/internal/model"
	"backend/internal/pkg"
)

// CreateTag 创建标签
func CreateTag(t *model.Tag) error {
	return DB.Create(t).Error
}

// GetTagByID 根据 ID 获取标签
func GetTagByID(id uint) (*model.Tag, error) {
	var t model.Tag
	err := DB.First(&t, id).Error
	return &t, err
}

// GetTagByUUID 根据 UUID 获取标签
func GetTagByUUID(uuid string) (*model.Tag, error) {
	var t model.Tag
	err := DB.Where("uuid = ?", uuid).First(&t).Error
	return &t, err
}

// GetTagByName 根据名称查询标签
func GetTagByName(name string) (*model.Tag, error) {
	var t model.Tag
	err := DB.Where("name = ?", name).First(&t).Error
	return &t, err
}

// UpdateTag 更新标签
func UpdateTag(t *model.Tag) error {
	return DB.Save(t).Error
}

// DeleteTag 软删除标签
func DeleteTag(id uint) error {
	return DB.Delete(&model.Tag{}, id).Error
}

// RemoveTagFromAllBlogs 删除关联表中该标签的所有记录
func RemoveTagFromAllBlogs(tagID uint) error {
	return DB.Where("tag_id = ?", tagID).Delete(&model.BlogTag{}).Error
}

// ListTags 分页查询标签列表（带帖子数）
func ListTags(page, pageSize int, search string) ([]model.Tag, int64, error) {
	db := DB.Model(&model.Tag{})
	if search != "" {
		db = db.Where("name LIKE ?", "%"+search+"%")
	}
	var total int64
	db.Count(&total)

	var tags []model.Tag
	err := db.Offset(pkg.Offset(page, pageSize)).Limit(pageSize).
		Order("name ASC").Find(&tags).Error

	// 填充帖子数量
	for i := range tags {
		DB.Table("blog_tags").Where("tag_id = ?", tags[i].ID).Count(&tags[i].BlogCount)
	}
	return tags, total, err
}

// ListAllTags 获取所有标签（不分页）
func ListAllTags() ([]model.Tag, error) {
	var tags []model.Tag
	err := DB.Order("name ASC").Find(&tags).Error
	return tags, err
}
