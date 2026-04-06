import { CONFIG } from 'src/global-config';

import { BlogCreateView } from './components/BlogCreateView';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new blog | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlogCreateView />
    </>
  );
}
