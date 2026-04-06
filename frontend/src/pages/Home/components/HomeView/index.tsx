import Stack from '@mui/material/Stack';

import { BackToTopButton } from 'src/components/Animate/back-to-top-button';
import { ScrollProgress, useScrollProgress } from 'src/components/Animate/scroll-progress';

import { HomeHero } from '../HomeHero';
import { HomeFAQs } from '../HomeFAQs';
import { HomeZoneUI } from '../HomeZoneUI';
import { HomeMinimal } from '../HomeMinimal';
import { HomePricing } from '../HomePricing';
import { HomeForDesigner } from '../HomeForDesigner';
import { HomeTestimonials } from '../HomeTestimonials';
import { HomeIntegrations } from '../HomeIntegrations';
import { HomeAdvertisement } from '../HomeAdvertisement';
import { HomeHugePackElements } from '../HomeHugePackElements';
import { HomeHighlightFeatures } from '../HomeHighlightFeatures';

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

      <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
        <HomeMinimal />

        <HomeHugePackElements />

        <HomeForDesigner />

        <HomeHighlightFeatures />

        <HomeIntegrations />

        <HomePricing />

        <HomeTestimonials />

        <HomeFAQs />

        <HomeZoneUI />

        <HomeAdvertisement />
      </Stack>
    </>
  );
}
