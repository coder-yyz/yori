import 'reflect-metadata';

import { Mock, Model, Property, Transform, DefaultValue } from 'transform-model';

import { formatDate, safeNumber } from './blog.model';

// ─── PhotoTag ─────────────────────────────────────────────────────────────────

export class PhotoTagModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('name')
  @DefaultValue('未知标签')
  name: string;

  @Property('photoCount')
  @Transform(safeNumber)
  photoCount: number;
}

// ─── PhotoItem ────────────────────────────────────────────────────────────────

export class PhotoItemModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('title')
  @DefaultValue('无标题')
  @Mock(($i: number) => `Mock 照片 ${$i + 1}`)
  title: string;

  @Property('description')
  @DefaultValue('')
  description: string;

  @Property('fileName')
  @DefaultValue('')
  fileName: string;

  @Property('mimeType')
  @DefaultValue('')
  mimeType: string;

  @Property('size')
  @Transform(safeNumber)
  size: number;

  @Property('width')
  @Transform(safeNumber)
  width: number;

  @Property('height')
  @Transform(safeNumber)
  height: number;

  @Property('url')
  @DefaultValue('')
  @Mock(($i: number) => `https://picsum.photos/seed/${$i + 1}/800/600`)
  url: string;

  @Property('tags')
  @Transform((tags: any[]) => (Array.isArray(tags) ? tags : []))
  tags: any[];

  @Property('createdAt')
  @Transform(formatDate)
  createdAt: string;

  @Property('updatedAt')
  @Transform(formatDate)
  updatedAt: string;
}
