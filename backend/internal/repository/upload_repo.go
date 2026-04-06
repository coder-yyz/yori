package repository

import "backend/internal/model"

// CreateUpload 保存上传记录
func CreateUpload(u *model.Upload) error {
	return DB.Create(u).Error
}

// GetUploadByUUID 根据 UUID 查询
func GetUploadByUUID(uuid string) (*model.Upload, error) {
	var u model.Upload
	err := DB.Where("uuid = ?", uuid).First(&u).Error
	return &u, err
}

// ListUploadsByUser 查询用户的上传记录
func ListUploadsByUser(userID uint, page, pageSize int) ([]model.Upload, int64, error) {
	var list []model.Upload
	var total int64
	q := DB.Model(&model.Upload{}).Where("user_id = ?", userID)
	q.Count(&total)
	err := q.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error
	return list, total, err
}

// ListAllUploads 管理员查询所有上传记录
func ListAllUploads(page, pageSize int) ([]model.Upload, int64, error) {
	var list []model.Upload
	var total int64
	q := DB.Model(&model.Upload{})
	q.Count(&total)
	err := q.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error
	return list, total, err
}

// DeleteUpload 删除上传记录
func DeleteUpload(id uint) error {
	return DB.Delete(&model.Upload{}, id).Error
}
