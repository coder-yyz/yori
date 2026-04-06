import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { useGetBlog } from 'src/actions/blog';

import { BlogDetailsHomeView } from './components/BlogDetailsHomeView';

// ----------------------------------------------------------------------

const metadata = { title: `Blog details - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { blog, isLoading, error } = useGetBlog(id);
  // const { latestBlogs } = useGetLatestBlogs(title);

  return (
    <>
      <title>{metadata.title}</title>

      <BlogDetailsHomeView
        blog={blog}
        // latestBlogs={latestBlogs}
        loading={isLoading}
        error={error}
      />
    </>
  );
}
