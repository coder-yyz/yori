import { CONFIG } from 'src/global-config';

import { SignInView } from './components/SignInView';

// ----------------------------------------------------------------------

const metadata = { title: `Sign in | Jwt - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <SignInView />
    </>
  );
}
