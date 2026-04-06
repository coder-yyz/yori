import { CONFIG } from 'src/global-config';

import { AccountSocialsView } from './components/AccountSocialsView';

// ----------------------------------------------------------------------

const metadata = { title: `Account socials settings | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AccountSocialsView />
    </>
  );
}
