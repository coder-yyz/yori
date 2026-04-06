import type { GridProps } from '@mui/material/Grid';
import type { IUserProfile, IUserProfileBlog } from 'src/types/user';

import { useRef } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import CardHeader from '@mui/material/CardHeader';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/Iconify';

import { ProfileBlogItemCard } from '../ProfileBlogItem';

// ----------------------------------------------------------------------

type Props = GridProps & {
  info: IUserProfile;
  blogs: IUserProfileBlog[];
};

export function ProfileHome({ info, blogs, sx, ...other }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAttach = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const renderFollows = () => (
    <Card sx={{ py: 3, textAlign: 'center', typography: 'h4' }}>
      <Stack
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        sx={{ flexDirection: 'row' }}
      >
        <Stack sx={{ width: 1 }}>
          {fNumber(info.totalFollowers)}
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            Follower
          </Box>
        </Stack>

        <Stack sx={{ width: 1 }}>
          {fNumber(info.totalFollowing)}
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            Following
          </Box>
        </Stack>
      </Stack>
    </Card>
  );

  const renderAbout = () => (
    <Card>
      <CardHeader title="About" />

      <Box
        sx={{
          p: 3,
          gap: 2,
          display: 'flex',
          typography: 'body2',
          flexDirection: 'column',
        }}
      >
        <div>{info.quote}</div>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="mingcute:location-fill" />
          <span>
            Live at
            <Link variant="subtitle2" color="inherit">
              &nbsp;{info.country}
            </Link>
          </span>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="solar:letter-bold" />
          {info.email}
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="solar:case-minimalistic-bold" />
          <span>
            {info.role} at
            <Link variant="subtitle2" color="inherit">
              &nbsp;{info.company}
            </Link>
          </span>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="solar:case-minimalistic-bold" />
          <span>
            Studied at
            <Link variant="subtitle2" color="inherit">
              &nbsp;{info.school}
            </Link>
          </span>
        </Box>
      </Box>
    </Card>
  );

  const renderBlogInput = () => (
    <Card sx={{ p: 3 }}>
      <InputBase
        multiline
        fullWidth
        rows={4}
        placeholder="Share what you are thinking here..."
        inputProps={{ id: 'blog-input' }}
        sx={[
          (theme) => ({
            p: 2,
            mb: 3,
            borderRadius: 1,
            border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
          }),
        ]}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
          <Fab size="small" color="inherit" variant="softExtended" onClick={handleAttach}>
            <Iconify icon="solar:gallery-wide-bold" width={24} sx={{ color: 'success.main' }} />
            Image/Video
          </Fab>
          <Fab size="small" color="inherit" variant="softExtended">
            <Iconify icon="solar:videocamera-record-bold" width={24} sx={{ color: 'error.main' }} />
            Streaming
          </Fab>
        </Box>

        <Button variant="contained">Blog</Button>
      </Box>

      <input ref={fileRef} type="file" style={{ display: 'none' }} />
    </Card>
  );

  const socials = [
    { value: 'twitter', label: 'Twitter', icon: 'socials:twitter', link: info.socialLinks.twitter },
    {
      value: 'facebook',
      label: 'Facebook',
      icon: 'socials:facebook',
      link: info.socialLinks.facebook,
    },
    {
      value: 'instagram',
      label: 'Instagram',
      icon: 'socials:instagram',
      link: info.socialLinks.instagram,
    },
    {
      value: 'linkedin',
      label: 'LinkedIn',
      icon: 'socials:linkedin',
      link: info.socialLinks.linkedin,
    },
  ].filter((s) => s.link);

  const renderSocials = () =>
    socials.length > 0 ? (
      <Card>
        <CardHeader title="Social" />

        <Box sx={{ p: 3, gap: 2, display: 'flex', flexDirection: 'column', typography: 'body2' }}>
          {socials.map((social) => (
            <Box
              key={social.value}
              sx={{
                gap: 2,
                display: 'flex',
                lineHeight: '20px',
                wordBreak: 'break-all',
                alignItems: 'flex-start',
              }}
            >
              <Iconify icon={social.icon as any} />
              <Link color="inherit">{social.link}</Link>
            </Box>
          ))}
        </Box>
      </Card>
    ) : null;

  return (
    <Grid container spacing={3} sx={sx} {...other}>
      <Grid size={{ xs: 12, md: 4 }} sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        {renderFollows()}
        {renderAbout()}
        {renderSocials()}
      </Grid>

      <Grid size={{ xs: 12, md: 8 }} sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        {renderBlogInput()}

        {blogs.map((blog) => (
          <ProfileBlogItemCard key={blog.id} blog={blog} />
        ))}
      </Grid>
    </Grid>
  );
}
