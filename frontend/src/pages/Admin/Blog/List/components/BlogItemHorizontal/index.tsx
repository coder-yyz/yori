import type { CardProps } from '@mui/material/Card';
import type { BlogItem } from 'src/types/blog';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import { deleteBlog } from 'src/actions/blog';

import { Label } from 'src/components/Label';
import { Image } from 'src/components/Image';
import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';
import { CustomPopover } from 'src/components/CustomPopover';

type Props = CardProps & {
  blog: BlogItem;
  editHref: string;
  detailsHref: string;
};

export function BlogItemHorizontal({ sx, blog, editHref, detailsHref, ...other }: Props) {
  const menuActions = usePopover();

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'bottom-center' } }}
    >
      <MenuList>
        <li>
          <MenuItem component={RouterLink} href={detailsHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
        </li>

        <li>
          <MenuItem component={RouterLink} href={editHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </li>

        <MenuItem
          onClick={async () => {
            try {
              await deleteBlog(blog.id);
              toast.success('删除成功');
            } catch (error) {
              console.error(error);
              toast.error('删除失败');
            }
            menuActions.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Card sx={[{ display: 'flex' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
        <Stack
          spacing={1}
          sx={[
            (theme) => ({
              flexGrow: 1,
              p: theme.spacing(3, 3, 2, 3),
            }),
          ]}
        >
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Label variant="soft" color={(blog.status === 'published' && 'info') || 'default'}>
              {blog.status === 'published' ? 'Published' : 'Draft'}
            </Label>

            <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
              {fDate(blog.createdAt)}
            </Box>
          </Box>

          <Stack spacing={1} sx={{ flexGrow: 1 }}>
            <Link
              component={RouterLink}
              href={detailsHref}
              color="inherit"
              variant="subtitle2"
              sx={[
                (theme) => ({
                  ...theme.mixins.maxLine({ line: 2 }),
                }),
              ]}
            >
              {blog.title}
            </Link>

            <Typography
              variant="body2"
              sx={[
                (theme) => ({
                  ...theme.mixins.maxLine({ line: 2 }),
                  color: 'text.secondary',
                }),
              ]}
            >
              {blog.description}
            </Typography>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>

            <Box
              sx={{
                gap: 1.5,
                flexGrow: 1,
                display: 'flex',
                flexWrap: 'wrap',
                typography: 'caption',
                color: 'text.disabled',
                justifyContent: 'flex-end',
              }}
            >
              <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:chat-round-dots-bold" width={16} />
                {fShortenNumber(blog.totalComments)}
              </Box>

              <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:eye-bold" width={16} />
                {fShortenNumber(blog.totalViews)}
              </Box>

              <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:share-bold" width={16} />
                {fShortenNumber(blog.totalShares)}
              </Box>
            </Box>
          </Box>
        </Stack>

        <Box
          sx={{
            p: 1,
            width: 180,
            height: 240,
            flexShrink: 0,
            position: 'relative',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Box
            sx={{
              top: 16,
              right: 16,
              zIndex: 9,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: 'common.white',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              }}
            >
              {blog.author.displayName}
            </Typography>
            <Avatar
              alt={blog.author.displayName}
              src={blog.author.photoURL}
              sx={{ width: 36, height: 36 }}
            />
          </Box>
          <Image alt={blog.title} src={blog.coverUrl} sx={{ height: 1, borderRadius: 1.5 }} />
        </Box>
      </Card>

      {renderMenuActions()}
    </>
  );
}
