import { AccountSocials } from '../AccountSocials';

// ----------------------------------------------------------------------

const emptySocialLinks = {
  facebook: '',
  instagram: '',
  linkedin: '',
  twitter: '',
};

export function AccountSocialsView() {
  return <AccountSocials socialLinks={emptySocialLinks} />;
}
