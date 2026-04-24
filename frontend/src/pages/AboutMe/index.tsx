import { CONFIG } from 'src/global-config';

import { AboutHero } from './components/AboutHero';
import { AboutTeam } from './components/AboutTeam';
import { AboutWhat } from './components/AboutWhat';
import { AboutVision } from './components/AboutVision';
import { AboutTestimonials } from './components/AboutTestimonials';

// ----------------------------------------------------------------------

const metadata = { title: `About us - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AboutHero />

      <AboutWhat />

      <AboutVision />

      <AboutTeam />

      <AboutTestimonials />
    </>
  );
}
