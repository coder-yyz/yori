import { CONFIG } from 'src/global-config';

import { TagListView } from './components/TagListView';

// ----------------------------------------------------------------------

const metadata = { title: `Tags | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <TagListView />
    </>
  );
}
