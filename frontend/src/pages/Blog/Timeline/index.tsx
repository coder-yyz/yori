import { CONFIG } from 'src/global-config';

import { TimelineView } from './components/TimelineView';

// ----------------------------------------------------------------------

const metadata = { title: `Coming soon - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <TimelineView />
    </>
  );
}
