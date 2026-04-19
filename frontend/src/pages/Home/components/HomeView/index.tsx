import { lazy, Suspense } from 'react';

import { BackToTopButton } from 'src/components/Animate/back-to-top-button';
import { ScrollProgress, useScrollProgress } from 'src/components/Animate/scroll-progress';

import { HomeHero } from '../HomeHero';

const HomeBelowTheFold = lazy(() => import('../HomeBelowTheFold'));

// ----------------------------------------------------------------------

export function HomeView() {
  const pageProgress = useScrollProgress();

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={[(theme) => ({ position: 'fixed', zIndex: theme.zIndex.appBar + 1 })]}
      />

      <BackToTopButton />

      <HomeHero />

      <Suspense fallback={<div style={{ minHeight: 800 }} aria-hidden="true" />}>
        <HomeBelowTheFold />
      </Suspense>
    </>
  );
}
