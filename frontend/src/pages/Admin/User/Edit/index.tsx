import useSWR from 'swr';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { getUserDetail } from 'src/http';

import { UserEditView } from './components/UserEditView';

// ----------------------------------------------------------------------

const metadata = { title: `User edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data } = useSWR(id ? ['adminUser', id] : null, () => getUserDetail(id), {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return (
    <>
      <title>{metadata.title}</title>

      <UserEditView user={data} />
    </>
  );
}
