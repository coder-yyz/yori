import { CONFIG } from 'src/global-config';

import { View403 } from './components/View403';

// ----------------------------------------------------------------------

const metadata = { title: `403 forbidden! | Error - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <View403 />
    </>
  );
}
