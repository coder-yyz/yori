import { CONFIG } from 'src/global-config';

import { UserProfileView } from './components/UserProfileView';

// ----------------------------------------------------------------------

const metadata = { title: `User profile | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <UserProfileView />
    </>
  );
}
