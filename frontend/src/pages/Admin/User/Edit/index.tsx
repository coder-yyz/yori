import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { useGetAdminUser } from 'src/actions/user';

import { UserEditView } from './components/UserEditView';

// ----------------------------------------------------------------------

const metadata = { title: `User edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { user } = useGetAdminUser(id);

  return (
    <>
      <title>{metadata.title}</title>

      <UserEditView user={user} />
    </>
  );
}
