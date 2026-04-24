import 'reflect-metadata';

import { Mock, Model, Property, Transform, DefaultValue } from 'transform-model';

import { formatDate } from './blog.model';

// ─── IUserItem（管理后台用户列表项） ───────────────────────────────────────────

export class UserItemModel extends Model {
  @Property('id')
  @DefaultValue('')
  id: string;

  @Property('username')
  @DefaultValue('')
  username: string;

  @Property('email')
  @DefaultValue('')
  @Mock(($i: number) => `mock_user_${$i}@example.com`)
  email: string;

  @Property('displayName')
  @DefaultValue('未知用户')
  @Mock(($i: number) => `Mock 用户 ${$i + 1}`)
  displayName: string;

  @Property('photoURL')
  @DefaultValue('')
  photoURL: string;

  @Property('phoneNumber')
  @DefaultValue('')
  phoneNumber: string;

  @Property('country')
  @DefaultValue('')
  country: string;

  @Property('address')
  @DefaultValue('')
  address: string;

  @Property('state')
  @DefaultValue('')
  state: string;

  @Property('city')
  @DefaultValue('')
  city: string;

  @Property('zipCode')
  @DefaultValue('')
  zipCode: string;

  @Property('about')
  @DefaultValue('')
  about: string;

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

  @Property('isAdmin')
  @DefaultValue(false)
  isAdmin: boolean;

  @Property('isActive')
  isActive: boolean;
}
