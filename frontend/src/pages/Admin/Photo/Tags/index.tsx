import { CONFIG } from 'src/global-config';

import { PhotoTagListView } from './components/PhotoTagListView';

// ----------------------------------------------------------------------

const metadata = { title: `Photo Tags | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <PhotoTagListView />
    </>
  );
}
