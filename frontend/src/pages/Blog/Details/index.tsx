import useSWR from 'swr';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { getBlog } from 'src/http';

import { BlogDetailsHomeView } from './components/BlogDetailsHomeView';

// ----------------------------------------------------------------------

const metadata = { title: `Blog details - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data, isLoading, error } = useSWR(id ? ['blog', id] : null, () => getBlog(id), {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return (
    <>
      <title>{metadata.title}</title>

      <BlogDetailsHomeView blog={data} loading={isLoading} error={error} />
    </>
  );
}
