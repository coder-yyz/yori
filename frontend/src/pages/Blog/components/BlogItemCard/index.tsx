import type { BoxProps } from '@mui/material/Box';
import type { CardProps } from '@mui/material/Card';
import type { BlogItem } from 'src/types/blog';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import { AvatarShape } from 'src/assets/illustrations';

import { Image } from 'src/components/Image';
import { Iconify } from 'src/components/Iconify';

// ----------------------------------------------------------------------

type BlogItemCardProps = CardProps & {
  blog: BlogItem;
  detailsHref: string;
};

export function BlogItemCard({ blog, detailsHref, sx, ...other }: BlogItemCardProps) {
  return (
    <Card sx={sx} {...other}>
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{
            left: 0,
            zIndex: 9,
            width: 88,
            height: 36,
            bottom: -16,
            position: 'absolute',
          }}
        />

        <Avatar
          alt={blog.author.displayName}
          src={blog.author.photoURL}
          sx={{
            left: 24,
            zIndex: 9,
            bottom: -24,
            position: 'absolute',
          }}
        />

        <Image alt={blog.title} src={blog.coverUrl} ratio="4/3" />
      </Box>

      <CardContent sx={{ pt: 6 }}>
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {blog.author.displayName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {fDate(blog.createdAt)}
          </Typography>
        </Box>

        <Link
          component={RouterLink}
          href={detailsHref}
          color="inherit"
          variant="subtitle2"
          sx={(theme) => ({
            ...theme.mixins.maxLine({ line: 2, persistent: theme.typography.subtitle2 }),
          })}
        >
          {blog.title}
        </Link>

        <InfoBlock
          totalViews={blog.totalViews}
          totalShares={blog.totalShares}
          totalComments={blog.totalComments}
        />
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

type BlogItemLatestProps = {
  blog: BlogItem;
  index: number;
  detailsHref: string;
};

export function BlogItemLatest({ blog, index, detailsHref }: BlogItemLatestProps) {
  const blogSmall = index === 1 || index === 2;

  return (
    <Card>
      <Box
        sx={{
          top: 24,
          left: 24,
          zIndex: 9,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Avatar alt={blog.author.displayName} src={blog.author.photoURL} />
        <Typography
          variant="subtitle2"
          sx={{ color: 'common.white', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
        >
          {blog.author.displayName}
        </Typography>
      </Box>

      <Image
        alt={blog.title}
        src={blog.coverUrl}
        ratio="4/3"
        sx={{ height: 360 }}
        slotProps={{
          overlay: {
            sx: (theme) => ({
              bgcolor: varAlpha(theme.vars.palette.grey['900Channel'], 0.64),
            }),
          },
        }}
      />

      <CardContent
        sx={{
          width: 1,
          zIndex: 9,
          bottom: 0,
          position: 'absolute',
          color: 'common.white',
        }}
      >
        <Typography variant="caption" component="div" sx={{ mb: 1, opacity: 0.64 }}>
          {fDate(blog.createdAt)}
        </Typography>

        <Link
          component={RouterLink}
          href={detailsHref}
          color="inherit"
          variant={blogSmall ? 'subtitle2' : 'h5'}
          sx={(theme) => ({
            ...theme.mixins.maxLine({
              line: 2,
              persistent: blogSmall ? theme.typography.subtitle2 : theme.typography.h5,
            }),
          })}
        >
          {blog.title}
        </Link>

        <InfoBlock
          totalViews={blog.totalViews}
          totalShares={blog.totalShares}
          totalComments={blog.totalComments}
          sx={{ opacity: 0.64, color: 'common.white' }}
        />
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

type InfoBlockProps = BoxProps & Pick<BlogItem, 'totalViews' | 'totalShares' | 'totalComments'>;

function InfoBlock({ sx, totalViews, totalShares, totalComments, ...other }: InfoBlockProps) {
  return (
    <Box
      sx={[
        () => ({
          mt: 3,
          gap: 1.5,
          display: 'flex',
          typography: 'caption',
          color: 'text.disabled',
          justifyContent: 'flex-end',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
        <Iconify width={16} icon="solar:chat-round-dots-bold" />
        {fShortenNumber(totalComments)}
      </Box>

      <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
        <Iconify width={16} icon="solar:eye-bold" />
        {fShortenNumber(totalViews)}
      </Box>

      <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
        <Iconify width={16} icon="solar:share-bold" />
        {fShortenNumber(totalShares)}
      </Box>
    </Box>
  );
}
