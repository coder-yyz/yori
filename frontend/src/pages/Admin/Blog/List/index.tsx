import { CONFIG } from 'src/global-config';

import { BlogListView } from './components/BlogListView';

// ----------------------------------------------------------------------

const metadata = { title: `Blog list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlogListView />
    </>
  );
}
