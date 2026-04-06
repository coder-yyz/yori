import { CONFIG } from 'src/global-config';

import { UserCardsView } from './components/UserCardsView';

// ----------------------------------------------------------------------

const metadata = { title: `User cards | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <UserCardsView />
    </>
  );
}
