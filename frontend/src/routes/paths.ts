const ROOTS = {
  ADMIN: '/admin',
  AUTH: '/auth',
};

export const paths = {
  auth: {
    signIn: `${ROOTS.AUTH}/sign-in`,
    signUp: `${ROOTS.AUTH}/sign-up`,
  },
  admin: {
    home: `${ROOTS.ADMIN}/`,
    user: {
      root: `${ROOTS.ADMIN}/user`,
      new: `${ROOTS.ADMIN}/user/new`,
      list: `${ROOTS.ADMIN}/user/list`,
      cards: `${ROOTS.ADMIN}/user/cards`,
      profile: `${ROOTS.ADMIN}/user/profile`,
      account: `${ROOTS.ADMIN}/user/account`,
      edit: (id: string) => `${ROOTS.ADMIN}/user/${id}/edit`,
    },
    blog: {
      root: `${ROOTS.ADMIN}/blog`,
      new: `${ROOTS.ADMIN}/blog/new`,
      details: (id: string) => `${ROOTS.ADMIN}/blog/${id}`,
      edit: (id: string) => `${ROOTS.ADMIN}/blog/${id}/edit`,
      tags: `${ROOTS.ADMIN}/blog/tags`,
      categories: `${ROOTS.ADMIN}/blog/categories`,
    },
    fileManager: `${ROOTS.ADMIN}/file-manager`,
  },
  blog: {
    root: '/blog',
    details: (id: string) => `/blog/${id}`,
    timeline: '/blog/timeline',
    others: '/blog/others',
  },

  comingSoon: '/coming-soon',
  about: '/about-us',
  faqs: '/faqs',
  docs: '/docs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  blank: '/blank',
  home: '/',
};
