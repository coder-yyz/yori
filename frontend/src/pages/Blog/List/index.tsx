import { CONFIG } from 'src/global-config';

import { BlogListHomeView } from './components/BlogListHomeView';

// ----------------------------------------------------------------------

const metadata = { title: `Blog list - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlogListHomeView />
    </>
  );
}
