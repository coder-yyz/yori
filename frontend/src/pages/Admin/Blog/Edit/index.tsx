import useSWR from 'swr';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { getAdminBlog } from 'src/http';

import { BlogEditView } from './components/BlogEditView';

// ----------------------------------------------------------------------

const metadata = { title: `Blog edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { data } = useSWR(id ? ['adminBlog', id] : null, () => getAdminBlog(id), {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return (
    <>
      <title>{metadata.title}</title>

      <BlogEditView blog={data} />
    </>
  );
}
