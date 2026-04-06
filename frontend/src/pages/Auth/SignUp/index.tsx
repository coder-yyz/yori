import { CONFIG } from 'src/global-config';

import { SignUpView } from './components/SignUpView';

// ----------------------------------------------------------------------

const metadata = { title: `Sign up | Jwt - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <SignUpView />
    </>
  );
}
