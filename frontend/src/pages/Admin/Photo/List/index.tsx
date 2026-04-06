import { CONFIG } from 'src/global-config';

import { PhotoListView } from './components/PhotoListView';

// ----------------------------------------------------------------------

const metadata = { title: `Photos | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <PhotoListView />
    </>
  );
}
