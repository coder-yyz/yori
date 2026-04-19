import Stack from '@mui/material/Stack';

import { HomeMinimal } from '../HomeMinimal';
import { HomeHugePackElements } from '../HomeHugePackElements';
import { HomeForDesigner } from '../HomeForDesigner';
import { HomeHighlightFeatures } from '../HomeHighlightFeatures';
import { HomeIntegrations } from '../HomeIntegrations';
import { HomePricing } from '../HomePricing';
import { HomeTestimonials } from '../HomeTestimonials';
import { HomeFAQs } from '../HomeFAQs';
import { HomeZoneUI } from '../HomeZoneUI';
import { HomeAdvertisement } from '../HomeAdvertisement';

// ----------------------------------------------------------------------

function HomeBelowTheFold() {
  return (
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
  );
}

export default HomeBelowTheFold;
