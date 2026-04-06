import { CONFIG } from 'src/global-config';

import { AccountGeneralView } from './components/AccountGeneralView';

// ----------------------------------------------------------------------

const metadata = { title: `Account general settings | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AccountGeneralView />
    </>
  );
}
