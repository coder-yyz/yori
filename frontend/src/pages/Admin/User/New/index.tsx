import { CONFIG } from 'src/global-config';

import { UserCreateView } from './components/UserCreateView';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new user | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <UserCreateView />
    </>
  );
}
