import 'reflect-metadata';
import { Model, Property, Transform, DefaultValue, Mock } from 'transform-model';
import { formatDate, safeNumber } from './blog.model';

// ─── IUserItem（管理后台用户列表项） ───────────────────────────────────────────

export class UserItemModel extends Model {
  @Property('id') @DefaultValue('') id: string;

  @Property('username') @DefaultValue('') username: string;

  @Property('email')
  @DefaultValue('')
  @Mock(($i: number) => `mock_user_${$i}@example.com`)
  email: string;

  @Property('displayName')
  @DefaultValue('未知用户')
  @Mock(($i: number) => `Mock 用户 ${$i + 1}`)
  displayName: string;

  @Property('photoURL') @DefaultValue('') photoURL: string;

  @Property('phoneNumber') @DefaultValue('') phoneNumber: string;

  @Property('country') @DefaultValue('') country: string;

  @Property('address') @DefaultValue('') address: string;

  @Property('state') @DefaultValue('') state: string;

  @Property('city') @DefaultValue('') city: string;

  @Property('zipCode') @DefaultValue('') zipCode: string;

  @Property('about') @DefaultValue('') about: string;

  @Property('role')
  @DefaultValue('user')
  @Mock('mock_role')
  role: string;

  @Property('isPublic')
  @DefaultValue(false)
  isPublic: boolean;

  @Property('status')
  @DefaultValue('active')
  status: string;

  @Property('createdAt')
  @Transform(formatDate)
  createdAt: string;

  @Property('updatedAt')
  @Transform(formatDate)
  updatedAt: string;

  /** 便捷方法：是否为管理员 */
  isAdmin() {
    return this.role === 'admin';
  }

  /** 便捷方法：是否启用 */
  isActive() {
    return this.status === 'active';
  }
}

// ─── AnalyticsOverview 子模型 ─────────────────────────────────────────────────

export class TypeCountModel extends Model {
  @Property('eventType') @DefaultValue('') eventType: string;
  @Property('count') @Transform(safeNumber) count: number;
}

export class DailyCountModel extends Model {
  @Property('date') @DefaultValue('') date: string;
  @Property('count') @Transform(safeNumber) count: number;
}

export class DailyTrafficModel extends Model {
  @Property('date') @DefaultValue('') date: string;
  @Property('pv') @Transform(safeNumber) pv: number;
  @Property('uv') @Transform(safeNumber) uv: number;
}

export class TopPageModel extends Model {
  @Property('pagePath') @DefaultValue('') pagePath: string;
  @Property('count') @Transform(safeNumber) count: number;
}

export class TopEventModel extends Model {
  @Property('eventName') @DefaultValue('') eventName: string;
  @Property('count') @Transform(safeNumber) count: number;
}

export class ErrorEventModel extends Model {
  @Property('id') @DefaultValue('') id: string;
  @Property('eventName') @DefaultValue('') eventName: string;
  @Property('pagePath') @DefaultValue('') pagePath: string;
  @Property('occurredAt') @Transform(formatDate) occurredAt: string;
  @Property('userId') @DefaultValue('') userId: string;
  @Property('city') @DefaultValue('') city: string;
  @Property('country') @DefaultValue('') country: string;
  @Property('ip') @DefaultValue('') ip: string;
  @Property('isLoggedIn') @DefaultValue(false) isLoggedIn: boolean;
  @Property('logTime') @Transform(formatDate) logTime: string;
  @Property('userInfo') @DefaultValue('') userInfo: string;
  @Property('meta') @DefaultValue('') meta: string;
}

export class EventItemModel extends Model {
  @Property('id') @DefaultValue('') id: string;
  @Property('eventType') @DefaultValue('') eventType: string;
  @Property('eventName') @DefaultValue('') eventName: string;
  @Property('pagePath') @DefaultValue('') pagePath: string;
  @Property('occurredAt') @Transform(formatDate) occurredAt: string;
  @Property('userId') @DefaultValue('') userId: string;
  @Property('city') @DefaultValue('') city: string;
  @Property('country') @DefaultValue('') country: string;
  @Property('ip') @DefaultValue('') ip: string;
  @Property('isLoggedIn') @DefaultValue(false) isLoggedIn: boolean;
  @Property('logTime') @Transform(formatDate) logTime: string;
  @Property('userInfo') @DefaultValue('') userInfo: string;
  @Property('meta') @DefaultValue('') meta: string;
}
