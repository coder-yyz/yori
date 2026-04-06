import { CONFIG } from 'src/global-config';

import { View500 } from './components/View500';

// ----------------------------------------------------------------------

const metadata = { title: `500 Internal server error! | Error - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <View500 />
    </>
  );
}
