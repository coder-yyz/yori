import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { useGetAdminBlog } from 'src/actions/blog';

import { BlogEditView } from './components/BlogEditView';

// ----------------------------------------------------------------------

const metadata = { title: `Blog edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { blog } = useGetAdminBlog(id);

  return (
    <>
      <title>{metadata.title}</title>

      <BlogEditView blog={blog} />
    </>
  );
}
