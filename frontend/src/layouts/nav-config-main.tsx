import type { NavMainProps } from './main/nav/types';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/Iconify';

export const navData: NavMainProps['data'] = [
  {
    title: 'Blog',
    path: paths.blog.root,
    icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
  },
  {
    title: 'Timeline',
    icon: <Iconify width={22} icon="solar:notebook-bold-duotone" />,
    path: paths.blog.timeline,
  },
  {
    title: 'Photo Wall',
    icon: <Iconify width={22} icon="solar:file-bold-duotone" />,
    path: paths.photoWall,
  },
  {
    title: 'Others',
    icon: <Iconify width={22} icon="solar:notebook-bold-duotone" />,
    path: paths.comingSoon,
  },
];
