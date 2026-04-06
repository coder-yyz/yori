import { CONFIG } from 'src/global-config';

import { AccountChangePasswordView } from './components/AccountChangePasswordView';

// ----------------------------------------------------------------------

const metadata = { title: `Account change password settings | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AccountChangePasswordView />
    </>
  );
}
