import { CONFIG } from 'src/global-config';

import { PhotoWallView } from './components/PhotoWallView';

// ----------------------------------------------------------------------

const metadata = { title: `Photo Wall - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <PhotoWallView />
    </>
  );
}
