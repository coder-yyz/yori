import useSWR from 'swr';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { getAdminBlog } from 'src/http';

import { BlogDetailsView } from './components/BlogDetailsView';

// ----------------------------------------------------------------------

const metadata = { title: `Blog details | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data, isLoading, error } = useSWR(id ? ['adminBlog', id] : null, () => getAdminBlog(id), {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return (
    <>
      <title>{metadata.title}</title>

      <BlogDetailsView blog={data} loading={isLoading} error={error} />
    </>
  );
}
