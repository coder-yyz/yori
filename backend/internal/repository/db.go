package repository

import (
	"log"

	"backend/config"
	"backend/internal/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	// 所有模型均无 GORM 关联注解，不会生成外键 DDL，无需特殊配置
	db, err := gorm.Open(sqlite.Open(config.Conf.Database.DSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
		// SQLite AutoMigrate 在某些代码路径下仍会生成含约束的 DDL，
		// 禁用以防止 "table has more than one primary key" 错误
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	db.Exec("PRAGMA journal_mode=WAL;")

	// Post→Blog 重命名迁移：表名 + 列名（幂等，已迁移过则自动跳过）
	renamePostToBlog(db)

	if err := db.AutoMigrate(
		&model.User{},
		&model.Category{},
		&model.Tag{},
		&model.BlogTag{},      // 显式关联表，纯数据列，无外键
		&model.BlogCategory{}, // 显式关联表，纯数据列，无外键
		&model.Blog{},
		&model.Comment{},
		&model.CommentLike{},
		&model.Favorite{},
		&model.BlogShare{},
		&model.Upload{},
		&model.Photo{},
		&model.PhotoTag{},
		&model.PhotoTagLink{},
		&model.TrackEvent{},
	); err != nil {
		log.Fatal("数据库迁移失败:", err)
	}

	// 迁移完成后开启外键运行时校验（不影响 DDL 生成）
	db.Exec("PRAGMA foreign_keys=ON;")

	DB = db
	log.Println("数据库初始化成功")
}

// renamePostToBlog 将旧 post 相关表名和列名迁移为 blog（幂等）
func renamePostToBlog(db *gorm.DB) {
	// 1. 重命名表（如果旧表存在）
	tables := [][2]string{
		{"posts", "blogs"},
		{"post_tags", "blog_tags"},
		{"post_categories", "blog_categories"},
		{"post_shares", "blog_shares"},
	}
	for _, t := range tables {
		var oldExists int
		db.Raw("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?", t[0]).Scan(&oldExists)
		if oldExists == 0 {
			continue
		}
		// 如果目标表已存在（空表，由之前的 AutoMigrate 创建），先删除它
		var newExists int
		db.Raw("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?", t[1]).Scan(&newExists)
		if newExists > 0 {
			db.Exec("DROP TABLE IF EXISTS `" + t[1] + "`")
		}
		db.Exec("ALTER TABLE `" + t[0] + "` RENAME TO `" + t[1] + "`")
		log.Printf("迁移: 表 %s → %s", t[0], t[1])
	}

	// 2. 重命名列 post_id → blog_id（如果旧列存在）
	columns := []string{"blog_tags", "blog_categories", "comments", "favorites", "blog_shares"}
	for _, tbl := range columns {
		var hasOld int
		db.Raw("SELECT COUNT(*) FROM pragma_table_info(?) WHERE name='post_id'", tbl).Scan(&hasOld)
		if hasOld > 0 {
			db.Exec("ALTER TABLE `" + tbl + "` RENAME COLUMN `post_id` TO `blog_id`")
			log.Printf("迁移: %s.post_id → blog_id", tbl)
		}
	}
}
