import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { useGetAdminBlog } from 'src/actions/blog';

import { BlogDetailsView } from './components/BlogDetailsView';

// ----------------------------------------------------------------------

const metadata = { title: `Blog details | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { blog, isLoading, error } = useGetAdminBlog(id);

  return (
    <>
      <title>{metadata.title}</title>

      <BlogDetailsView blog={blog} loading={isLoading} error={error} />
    </>
  );
}
