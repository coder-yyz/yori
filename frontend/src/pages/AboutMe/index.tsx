import { CONFIG } from 'src/global-config';

import { AboutView } from './components/AboutView';

// ----------------------------------------------------------------------

const metadata = { title: `About us - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AboutView />
    </>
  );
}
