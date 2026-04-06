package repository

import (
	"backend/internal/model"
	"backend/internal/pkg"

	"gorm.io/gorm"
)

// ToggleFavorite 切换收藏状态，返回 true=已收藏 false=取消收藏
func ToggleFavorite(userID, blogID uint) (bool, error) {
	var fav model.Favorite
	result := DB.Where("user_id = ? AND blog_id = ?", userID, blogID).First(&fav)
	if result.Error == nil {
		// 已收藏，取消
		if err := DB.Delete(&fav).Error; err != nil {
			return false, err
		}
		DB.Model(&model.Blog{}).Where("id = ?", blogID).
			UpdateColumn("total_favorites", gorm.Expr("total_favorites - 1"))
		return false, nil
	}
	// 新增收藏
	if err := DB.Create(&model.Favorite{UserID: userID, BlogID: blogID}).Error; err != nil {
		return false, err
	}
	DB.Model(&model.Blog{}).Where("id = ?", blogID).
		UpdateColumn("total_favorites", gorm.Expr("total_favorites + 1"))
	return true, nil
}

// ListFavoritesByUser 获取用户收藏的博客列表
func ListFavoritesByUser(userID uint, page, pageSize int) ([]model.Blog, int64, error) {
	var total int64
	DB.Model(&model.Favorite{}).Where("user_id = ?", userID).Count(&total)

	var favs []model.Favorite
	DB.Where("user_id = ?", userID).
		Offset(pkg.Offset(page, pageSize)).Limit(pageSize).
		Order("created_at DESC").Find(&favs)

	blogIDs := make([]uint, 0, len(favs))
	for _, f := range favs {
		blogIDs = append(blogIDs, f.BlogID)
	}

	if len(blogIDs) == 0 {
		return []model.Blog{}, total, nil
	}

	var blogs []model.Blog
	if err := DB.Where("id IN ?", blogIDs).Find(&blogs).Error; err != nil {
		return nil, 0, err
	}
	return loadBlogRelations(blogs), total, nil
}

// RecordShare 记录分享
func RecordShare(blogID, userID uint, ip string) error {
	share := &model.BlogShare{BlogID: blogID, UserID: userID, IP: ip}
	if err := DB.Create(share).Error; err != nil {
		return err
	}
	return DB.Model(&model.Blog{}).Where("id = ?", blogID).
		UpdateColumn("total_shares", gorm.Expr("total_shares + 1")).Error
}
