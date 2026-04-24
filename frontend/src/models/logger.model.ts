// ─── AnalyticsOverview 子模型 ─────────────────────────────────────────────────

import { Model, Property, Transform, DefaultValue } from 'transform-model';

import { safeNumber, formatDate } from './blog.model';

export class TypeCountModel extends Model {
  @Property('eventType')
  @DefaultValue('')
  eventType: string;

  @Property('count')
  @Transform(safeNumber)
  count: number;
}

export class DailyCountModel extends Model {
  @Property('date')
  @DefaultValue('')
  date: string;

  @Property('count')
  @Transform(safeNumber)
  count: number;
}

export class DailyTrafficModel extends Model {
  @Property('date')
  @DefaultValue('')
  date: string;

  @Property('pv')
  @Transform(safeNumber)
  pv: number;

  @Property('uv')
  @Transform(safeNumber)
  uv: number;
}

export class TopPageModel extends Model {
  @Property('pagePath')
  @DefaultValue('')
  pagePath: string;

  @Property('count')
  @Transform(safeNumber)
  count: number;
}

export class TopEventModel extends Model {
  @Property('eventName')
  @DefaultValue('')
  eventName: string;

  @Property('count')
  @Transform(safeNumber)
  count: number;
}

export class ErrorEventModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('eventName')
  @DefaultValue('')
  eventName: string;

  @Property('pagePath')
  @DefaultValue('')
  pagePath: string;

  @Property('occurredAt')
  @Transform(formatDate)
  occurredAt: string;

  @Property('userId')
  @DefaultValue('')
  userId: string;

  @Property('city')
  @DefaultValue('')
  city: string;

  @Property('country')
  @DefaultValue('')
  country: string;

  @Property('ip')
  @DefaultValue('')
  ip: string;

  @Property('isLoggedIn')
  @DefaultValue(false)
  isLoggedIn: boolean;

  @Property('logTime')
  @Transform(formatDate)
  logTime: string;

  @Property('userInfo')
  @DefaultValue('')
  userInfo: string;

  @Property('meta')
  @DefaultValue('')
  meta: string;
}

export class EventItemModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('eventType')
  @DefaultValue('')
  eventType: string;

  @Property('eventName')
  @DefaultValue('')
  eventName: string;

  @Property('pagePath')
  @DefaultValue('')
  pagePath: string;

  @Property('occurredAt')
  @Transform(formatDate)
  occurredAt: string;

  @Property('userId')
  @DefaultValue('')
  userId: string;

  @Property('city')
  @DefaultValue('')
  city: string;

  @Property('country')
  @DefaultValue('')
  country: string;

  @Property('ip')
  @DefaultValue('')
  ip: string;

  @Property('isLoggedIn')
  @DefaultValue(false)
  isLoggedIn: boolean;

  @Property('logTime')
  @Transform(formatDate)
  logTime: string;

  @Property('userInfo')
  @DefaultValue('')
  userInfo: string;

  @Property('meta')
  @DefaultValue('')
  meta: string;
}
