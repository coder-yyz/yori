package repository

import (
	"backend/internal/model"
	"backend/internal/pkg"

	"gorm.io/gorm"
)

// loadBlogRelations 批量填充 blogs 的 Author/Tags/Categories（避免 N+1）
func loadBlogRelations(blogs []model.Blog) []model.Blog {
	if len(blogs) == 0 {
		return blogs
	}

	blogIDs := make([]uint, 0, len(blogs))
	authorIDSet := make(map[uint]bool)
	for _, p := range blogs {
		blogIDs = append(blogIDs, p.ID)
		authorIDSet[p.AuthorID] = true
	}

	// 批量加载作者
	authorIDs := make([]uint, 0, len(authorIDSet))
	for id := range authorIDSet {
		authorIDs = append(authorIDs, id)
	}
	var authors []model.User
	DB.Where("id IN ?", authorIDs).Find(&authors)
	authorMap := make(map[uint]model.UserBrief, len(authors))
	for _, a := range authors {
		authorMap[a.ID] = a.ToBrief()
	}

	// 批量加载博客-标签关联
	var blogTags []model.BlogTag
	DB.Where("blog_id IN ?", blogIDs).Find(&blogTags)
	tagIDSet := make(map[uint]bool)
	tagIDsByBlog := make(map[uint][]uint)
	for _, pt := range blogTags {
		tagIDsByBlog[pt.BlogID] = append(tagIDsByBlog[pt.BlogID], pt.TagID)
		tagIDSet[pt.TagID] = true
	}
	allTagIDs := make([]uint, 0, len(tagIDSet))
	for id := range tagIDSet {
		allTagIDs = append(allTagIDs, id)
	}
	tagByID := make(map[uint]model.Tag)
	if len(allTagIDs) > 0 {
		var tags []model.Tag
		DB.Where("id IN ?", allTagIDs).Find(&tags)
		for _, t := range tags {
			tagByID[t.ID] = t
		}
	}

	// 批量加载博客-分类关联
	var blogCats []model.BlogCategory
	DB.Where("blog_id IN ?", blogIDs).Find(&blogCats)
	catIDSet := make(map[uint]bool)
	catIDsByBlog := make(map[uint][]uint)
	for _, pc := range blogCats {
		catIDsByBlog[pc.BlogID] = append(catIDsByBlog[pc.BlogID], pc.CategoryID)
		catIDSet[pc.CategoryID] = true
	}
	allCatIDs := make([]uint, 0, len(catIDSet))
	for id := range catIDSet {
		allCatIDs = append(allCatIDs, id)
	}
	catByID := make(map[uint]model.Category)
	if len(allCatIDs) > 0 {
		var cats []model.Category
		DB.Where("id IN ?", allCatIDs).Find(&cats)
		for _, c := range cats {
			catByID[c.ID] = c
		}
	}

	// 组装
	for i := range blogs {
		blogs[i].Author = authorMap[blogs[i].AuthorID]

		tagIDs := tagIDsByBlog[blogs[i].ID]
		blogs[i].Tags = make([]model.Tag, 0, len(tagIDs))
		for _, tid := range tagIDs {
			if t, ok := tagByID[tid]; ok {
				blogs[i].Tags = append(blogs[i].Tags, t)
			}
		}

		catIDs := catIDsByBlog[blogs[i].ID]
		blogs[i].Categories = make([]model.Category, 0, len(catIDs))
		for _, cid := range catIDs {
			if c, ok := catByID[cid]; ok {
				blogs[i].Categories = append(blogs[i].Categories, c)
			}
		}
	}
	return blogs
}

// CreateBlog 创建博客及关联关系（事务）
func CreateBlog(blog *model.Blog, tagIDs, categoryIDs []uint) error {
	tx := DB.Begin()
	if err := tx.Create(blog).Error; err != nil {
		tx.Rollback()
		return err
	}
	for _, tid := range tagIDs {
		if err := tx.Create(&model.BlogTag{BlogID: blog.ID, TagID: tid}).Error; err != nil {
			tx.Rollback()
			return err
		}
	}
	for _, cid := range categoryIDs {
		if err := tx.Create(&model.BlogCategory{BlogID: blog.ID, CategoryID: cid}).Error; err != nil {
			tx.Rollback()
			return err
		}
	}
	return tx.Commit().Error
}

// GetBlogByID 根据内部 ID 获取博客详情（含关联数据）
func GetBlogByID(id uint) (*model.Blog, error) {
	var blog model.Blog
	if err := DB.First(&blog, id).Error; err != nil {
		return nil, err
	}
	blogs := loadBlogRelations([]model.Blog{blog})
	return &blogs[0], nil
}

// GetBlogByUUID 根据 UUID 获取博客详情（含关联数据）
func GetBlogByUUID(uuid string) (*model.Blog, error) {
	var blog model.Blog
	if err := DB.Where("uuid = ?", uuid).First(&blog).Error; err != nil {
		return nil, err
	}
	blogs := loadBlogRelations([]model.Blog{blog})
	return &blogs[0], nil
}

// UpdateBlog 更新博客及关联关系（事务）
func UpdateBlog(blog *model.Blog, tagIDs, categoryIDs []uint) error {
	tx := DB.Begin()
	if err := tx.Save(blog).Error; err != nil {
		tx.Rollback()
		return err
	}
	// 重建标签关联
	tx.Where("blog_id = ?", blog.ID).Delete(&model.BlogTag{})
	for _, tid := range tagIDs {
		tx.Create(&model.BlogTag{BlogID: blog.ID, TagID: tid})
	}
	// 重建分类关联
	tx.Where("blog_id = ?", blog.ID).Delete(&model.BlogCategory{})
	for _, cid := range categoryIDs {
		tx.Create(&model.BlogCategory{BlogID: blog.ID, CategoryID: cid})
	}
	return tx.Commit().Error
}

// DeleteBlog 软删除博客
func DeleteBlog(id uint) error {
	return DB.Delete(&model.Blog{}, id).Error
}

// DeleteBlogsByAuthor 软删除某个作者的所有博客
func DeleteBlogsByAuthor(authorID uint) error {
	return DB.Where("author_id = ?", authorID).Delete(&model.Blog{}).Error
}

// ListBlogs 分页查询博客（含批量关联数据）
func ListBlogs(query *model.BlogListQuery, onlyPublished bool) ([]model.Blog, int64, error) {
	db := DB.Model(&model.Blog{})

	if onlyPublished {
		db = db.Where("status = ?", model.BlogStatusPublished)
	} else if query.Status != "" {
		db = db.Where("status = ?", query.Status)
	}
	if query.AuthorID > 0 {
		db = db.Where("author_id = ?", query.AuthorID)
	}
	if query.Search != "" {
		like := "%" + query.Search + "%"
		db = db.Where("title LIKE ? OR description LIKE ? OR content LIKE ?", like, like, like)
	}
	// 按分类过滤：先查关联表取 blogIDs
	if query.CategoryID > 0 {
		var blogIDs []uint
		DB.Model(&model.BlogCategory{}).Where("category_id = ?", query.CategoryID).Pluck("blog_id", &blogIDs)
		if len(blogIDs) == 0 {
			return []model.Blog{}, 0, nil
		}
		db = db.Where("id IN ?", blogIDs)
	}
	// 按标签过滤
	if query.TagID > 0 {
		var blogIDs []uint
		DB.Model(&model.BlogTag{}).Where("tag_id = ?", query.TagID).Pluck("blog_id", &blogIDs)
		if len(blogIDs) == 0 {
			return []model.Blog{}, 0, nil
		}
		db = db.Where("id IN ?", blogIDs)
	}

	// 排序字段白名单（防 SQL 注入）
	allowedSort := map[string]bool{
		"created_at": true, "total_views": true,
		"total_favorites": true, "total_comments": true,
	}
	sortBy := "created_at"
	if allowedSort[query.SortBy] {
		sortBy = query.SortBy
	}
	sortOrder := "DESC"
	if query.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	var total int64
	db.Count(&total)

	var blogs []model.Blog
	err := db.Offset(pkg.Offset(query.Page, query.PageSize)).Limit(query.PageSize).
		Order(sortBy + " " + sortOrder).Find(&blogs).Error
	if err != nil {
		return nil, 0, err
	}
	return loadBlogRelations(blogs), total, nil
}

// IncrBlogViews 原子递增浏览量
func IncrBlogViews(id uint) error {
	return DB.Model(&model.Blog{}).Where("id = ?", id).
		UpdateColumn("total_views", gorm.Expr("total_views + 1")).Error
}


