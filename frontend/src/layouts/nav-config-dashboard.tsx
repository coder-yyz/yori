import type { NavSectionProps } from 'src/components/NavSection';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/SvgColor';

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

/**
 * Input nav data is an array of navigation section items used to define the structure and content of a navigation bar.
 * Each section contains a subheader and an array of items, which can include nested children items.
 *
 * Each item can have the following properties:
 * - `title`: The title of the navigation item.
 * - `path`: The URL path the item links to.
 * - `icon`: An optional icon component to display alongside the title.
 * - `info`: Optional additional information to display, such as a label.
 * - `allowedRoles`: An optional array of roles that are allowed to see the item.
 * - `caption`: An optional caption to display below the title.
 * - `children`: An optional array of nested navigation items.
 * - `disabled`: An optional boolean to disable the item.
 * - `deepMatch`: An optional boolean to indicate if the item should match subpaths.
 */
export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [{ title: 'Home', path: paths.admin.home, icon: ICONS.dashboard }],
  },
  /**
   * Management
   */
  {
    subheader: 'Management',
    items: [
      {
        title: 'User',
        path: paths.admin.user.root,
        icon: ICONS.user,
        children: [
          { title: 'Profile', path: paths.admin.user.root },
          { title: 'Cards', path: paths.admin.user.cards, allowedRoles: ['root', 'admin'] },
          { title: 'List', path: paths.admin.user.list, allowedRoles: ['root', 'admin'] },
          { title: 'Create', path: paths.admin.user.new, allowedRoles: ['root', 'admin'] },
          { title: 'Edit', path: paths.admin.user.edit('demo'), allowedRoles: ['root', 'admin'] },
          { title: 'Account', path: paths.admin.user.account, deepMatch: true },
        ],
      },
      {
        title: 'Blog',
        path: paths.admin.blog.root,
        icon: ICONS.blog,
        children: [
          { title: 'List', path: paths.admin.blog.root },
          { title: 'Create', path: paths.admin.blog.new },
          {
            title: 'Tags',
            path: paths.admin.blog.tags,
            allowedRoles: ['root', 'admin'],
          },
          {
            title: 'Categories',
            path: paths.admin.blog.categories,
            allowedRoles: ['root', 'admin'],
          },
        ],
      },
      {
        title: 'File manager',
        path: paths.admin.fileManager,
        icon: ICONS.folder,
        allowedRoles: ['root', 'admin'],
      },
      {
        title: 'Photo',
        path: paths.admin.photo.root,
        icon: icon('ic-blog'),
        allowedRoles: ['root', 'admin'],
        children: [
          { title: 'List', path: paths.admin.photo.root },
          { title: 'Tags', path: paths.admin.photo.tags },
        ],
      },
    ],
  },
];
