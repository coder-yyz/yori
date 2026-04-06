import { CONFIG } from 'src/global-config';

import { CategoryListView } from './components/CategoryListView';

// ----------------------------------------------------------------------

const metadata = { title: `Categories | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CategoryListView />
    </>
  );
}
