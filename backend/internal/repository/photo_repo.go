package repository

import (
	"backend/internal/model"

	"gorm.io/gorm"
)

// ──── Photo CRUD ────

func CreatePhoto(photo *model.Photo, tagIDs []uint) error {
	return DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(photo).Error; err != nil {
			return err
		}
		for _, tid := range tagIDs {
			if err := tx.Create(&model.PhotoTagLink{PhotoID: photo.ID, PhotoTagID: tid}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func UpdatePhoto(photo *model.Photo, tagIDs []uint) error {
	return DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(photo).Error; err != nil {
			return err
		}
		tx.Where("photo_id = ?", photo.ID).Delete(&model.PhotoTagLink{})
		for _, tid := range tagIDs {
			if err := tx.Create(&model.PhotoTagLink{PhotoID: photo.ID, PhotoTagID: tid}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func GetPhotoByUUID(uuid string) (*model.Photo, error) {
	var p model.Photo
	err := DB.Where("uuid = ?", uuid).First(&p).Error
	return &p, err
}

func DeletePhoto(id uint) error {
	DB.Where("photo_id = ?", id).Delete(&model.PhotoTagLink{})
	return DB.Delete(&model.Photo{}, id).Error
}

func ListPhotos(page, pageSize int, tagID uint) ([]model.Photo, int64, error) {
	var list []model.Photo
	var total int64
	q := DB.Model(&model.Photo{})
	if tagID > 0 {
		q = q.Where("id IN (?)", DB.Model(&model.PhotoTagLink{}).Select("photo_id").Where("photo_tag_id = ?", tagID))
	}
	q.Count(&total)
	err := q.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error
	if err == nil {
		loadPhotoTags(list)
	}
	return list, total, err
}

func ListAllPhotos(tagID uint) ([]model.Photo, int64, error) {
	var list []model.Photo
	var total int64
	q := DB.Model(&model.Photo{})
	if tagID > 0 {
		q = q.Where("id IN (?)", DB.Model(&model.PhotoTagLink{}).Select("photo_id").Where("photo_tag_id = ?", tagID))
	}
	q.Count(&total)
	err := q.Order("created_at DESC").Find(&list).Error
	if err == nil {
		loadPhotoTags(list)
	}
	return list, total, err
}

func loadPhotoTags(photos []model.Photo) {
	if len(photos) == 0 {
		return
	}
	ids := make([]uint, len(photos))
	for i := range photos {
		ids[i] = photos[i].ID
	}
	var links []model.PhotoTagLink
	DB.Where("photo_id IN ?", ids).Find(&links)

	tagIDSet := map[uint]bool{}
	photoTagMap := map[uint][]uint{}
	for _, l := range links {
		tagIDSet[l.PhotoTagID] = true
		photoTagMap[l.PhotoID] = append(photoTagMap[l.PhotoID], l.PhotoTagID)
	}

	tagIDs := make([]uint, 0, len(tagIDSet))
	for id := range tagIDSet {
		tagIDs = append(tagIDs, id)
	}
	var tags []model.PhotoTag
	if len(tagIDs) > 0 {
		DB.Where("id IN ?", tagIDs).Find(&tags)
	}
	tagMap := map[uint]model.PhotoTag{}
	for _, t := range tags {
		tagMap[t.ID] = t
	}

	for i := range photos {
		var pt []model.PhotoTag
		for _, tid := range photoTagMap[photos[i].ID] {
			if t, ok := tagMap[tid]; ok {
				pt = append(pt, t)
			}
		}
		if pt == nil {
			pt = []model.PhotoTag{}
		}
		photos[i].Tags = pt
	}
}

// ──── PhotoTag CRUD ────

func CreatePhotoTag(tag *model.PhotoTag) error {
	return DB.Create(tag).Error
}

func UpdatePhotoTag(tag *model.PhotoTag) error {
	return DB.Save(tag).Error
}

func GetPhotoTagByUUID(uuid string) (*model.PhotoTag, error) {
	var t model.PhotoTag
	err := DB.Where("uuid = ?", uuid).First(&t).Error
	return &t, err
}

func GetPhotoTagByName(name string) (*model.PhotoTag, error) {
	var t model.PhotoTag
	err := DB.Where("name = ?", name).First(&t).Error
	return &t, err
}

func DeletePhotoTag(id uint) error {
	DB.Where("photo_tag_id = ?", id).Delete(&model.PhotoTagLink{})
	return DB.Delete(&model.PhotoTag{}, id).Error
}

func ListPhotoTags(page, pageSize int, search string) ([]model.PhotoTag, int64, error) {
	var list []model.PhotoTag
	var total int64
	q := DB.Model(&model.PhotoTag{})
	if search != "" {
		q = q.Where("name LIKE ?", "%"+search+"%")
	}
	q.Count(&total)
	err := q.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error
	if err == nil {
		fillPhotoTagCounts(list)
	}
	return list, total, err
}

func ListAllPhotoTags() ([]model.PhotoTag, error) {
	var list []model.PhotoTag
	err := DB.Order("name ASC").Find(&list).Error
	if err == nil {
		fillPhotoTagCounts(list)
	}
	return list, err
}

func fillPhotoTagCounts(tags []model.PhotoTag) {
	for i := range tags {
		var count int64
		DB.Model(&model.PhotoTagLink{}).Where("photo_tag_id = ?", tags[i].ID).Count(&count)
		tags[i].PhotoCount = count
	}
}
