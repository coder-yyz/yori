package service

import (
	"errors"

	"backend/internal/model"
	"backend/internal/repository"
)

// CreateTag 创建标签
func CreateTag(req *model.CreateTagReq) (*model.Tag, error) {
	if _, err := repository.GetTagByName(req.Name); err == nil {
		return nil, errors.New("标签名称已存在")
	}
	t := &model.Tag{Name: req.Name}
	if err := repository.CreateTag(t); err != nil {
		return nil, errors.New("创建标签失败")
	}
	return t, nil
}

// GetTag 获取标签详情
func GetTag(uuid string) (*model.Tag, error) {
	t, err := repository.GetTagByUUID(uuid)
	if err != nil {
		return nil, errors.New("标签不存在")
	}
	return t, nil
}

// UpdateTag 更新标签
func UpdateTag(uuid string, req *model.UpdateTagReq) (*model.Tag, error) {
	t, err := repository.GetTagByUUID(uuid)
	if err != nil {
		return nil, errors.New("标签不存在")
	}
	t.Name = req.Name
	if err := repository.UpdateTag(t); err != nil {
		return nil, errors.New("更新标签失败")
	}
	return t, nil
}

// DeleteTag 删除标签
func DeleteTag(uuid string) error {
	t, err := repository.GetTagByUUID(uuid)
	if err != nil {
		return errors.New("标签不存在")
	}
	// 先清除博客与该标签的关联
	if err := repository.RemoveTagFromAllBlogs(t.ID); err != nil {
		return errors.New("清除标签关联失败")
	}
	return repository.DeleteTag(t.ID)
}

// ListTags 查询标签列表
func ListTags(page, pageSize int, search string) ([]model.Tag, int64, error) {
	return repository.ListTags(page, pageSize, search)
}

// ListAllTags 获取所有标签
func ListAllTags() ([]model.Tag, error) {
	return repository.ListAllTags()
}
