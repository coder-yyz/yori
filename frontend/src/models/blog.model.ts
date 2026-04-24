import 'reflect-metadata';

import dayjs from 'dayjs';
import { Type, Mock, Model, Logger, Property, Transform, DefaultValue } from 'transform-model';

export const formatDate = (val: any) =>
  val && dayjs(val).isValid() ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '--';

export const safeNumber = (val: any) => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

export class BlogTagModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('name')
  @DefaultValue('未知标签')
  name: string;

  @Property('blogCount')
  @Transform(safeNumber)
  blogCount: number;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export class BlogCategoryModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('name')
  @DefaultValue('未分类')
  name: string;

  @Property('slug')
  @DefaultValue('')
  slug: string;

  @Property('description')
  @DefaultValue('')
  description: string;

  @Property('blogCount')
  @Transform(safeNumber)
  blogCount: number;
}

// ─── Author ───────────────────────────────────────────────────────────────────

export class AuthorModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('username')
  @DefaultValue('')
  username: string;

  @Property('displayName')
  @DefaultValue('匿名作者')
  displayName: string;

  @Property('photoURL')
  @DefaultValue('')
  photoURL: string;
}

// ─── BlogItem ─────────────────────────────────────────────────────────────────

export class BlogItemModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('title')
  @DefaultValue('无标题')
  @Mock(($i: number) => `Mock 博客标题 ${$i + 1}`)
  title: string;

  @Property('description')
  @DefaultValue('')
  description: string;

  @Property('content')
  @DefaultValue('')
  content: string;

  @Property('contentType')
  @DefaultValue('markdown')
  contentType: string;

  @Property('coverUrl')
  @DefaultValue('')
  coverUrl: string;

  @Property('tags')
  @Type(BlogTagModel)
  tags: BlogTagModel[];

  @Property('categories')
  @Type(BlogCategoryModel)
  categories: BlogCategoryModel[];

  @Property('author')
  @Type(AuthorModel)
  author: AuthorModel;

  @Property('createdAt')
  @Transform(formatDate)
  @Logger((info) => {
    if (import.meta.env.DEV) {
      console.debug(
        `[BlogItemModel] createdAt raw=${info.rawValues[0]} → ${info.transformedValue}`
      );
    }
  })
  createdAt: string;

  @Property('updatedAt')
  @Transform(formatDate)
  updatedAt: string;

  @Property('status')
  @DefaultValue('draft')
  status: string;

  @Property('totalViews')
  @Transform(safeNumber)
  totalViews: number;

  @Property('totalShares')
  @Transform(safeNumber)
  totalShares: number;

  @Property('totalComments')
  @Transform(safeNumber)
  totalComments: number;

  @Property('totalFavorites')
  @Transform(safeNumber)
  totalFavorites: number;

  @Property('metaTitle')
  @DefaultValue('')
  metaTitle: string;

  @Property('metaDescription')
  @DefaultValue('')
  metaDescription: string;

  @Property('metaKeywords')
  @DefaultValue('')
  metaKeywords: string;

  @Property('isPublished')
  isPublished: boolean;
}

// ─── Comment ──────────────────────────────────────────────────────────────────

export class CommentUserModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('username')
  @DefaultValue('')
  username: string;

  @Property('displayName')
  @DefaultValue('匿名')
  displayName: string;

  @Property('photoURL')
  @DefaultValue('')
  photoURL: string;
}

export class CommentModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('content')
  @DefaultValue('')
  content: string;

  @Property('likes')
  @Transform(safeNumber)
  likes: number;

  @Property('parentId')
  @DefaultValue(null)
  parentId: string | null;

  @Property('user')
  @Type(CommentUserModel)
  user: CommentUserModel;

  @Property('createdAt')
  @Transform(formatDate)
  createdAt: string;

  @Property('replies')
  @DefaultValue([])
  replies: CommentModel[];
}
