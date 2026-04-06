import type { IDateValue } from './common';

export type Tag = {
  id: string;
  name: string;
  blogCount?: number;
};

export type Category = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  blogCount?: number;
  children?: Category[];
};

export type Author = {
  id: string;
  username: string;
  displayName: string;
  photoURL: string;
};

export type Comment = {
  id: string;
  content: string;
  likes: number;
  parentId?: string | null;
  user: {
    id: string;
    username: string;
    displayName: string;
    photoURL: string;
  };
  replies?: Comment[];
  createdAt: IDateValue;
};

export type ContentType = 'markdown' | 'html';

export type BlogItem = {
  id: string;
  title: string;
  description: string;
  content: string;
  contentType: ContentType;
  coverUrl: string;
  tags: Tag[];
  categories: Category[];
  author: Author;
  createdAt: IDateValue;
  updatedAt: IDateValue;
  status: 'draft' | 'published' | 'archived';
  totalViews: number;
  totalShares: number;
  totalComments: number;
  totalFavorites: number;

  metaKeywords: string;
  metaTitle: string;
  metaDescription: string;
};
