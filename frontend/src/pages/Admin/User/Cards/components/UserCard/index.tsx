import type { CardProps } from '@mui/material/Card';
import type { IUserItem } from 'src/types/user';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';

import { AvatarShape } from 'src/assets/illustrations';

import { Label } from 'src/components/Label';
import { Image } from 'src/components/Image';

// ----------------------------------------------------------------------

type Props = CardProps & {
  user: IUserItem;
};

export function UserCard({ user, sx, ...other }: Props) {
  return (
    <Card sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{
            left: 0,
            right: 0,
            zIndex: 10,
            mx: 'auto',
            bottom: -26,
            position: 'absolute',
          }}
        />

        <Avatar
          alt={user.displayName}
          src={user.photoURL}
          sx={{
            left: 0,
            right: 0,
            width: 64,
            height: 64,
            zIndex: 11,
            mx: 'auto',
            bottom: -32,
            position: 'absolute',
          }}
        />

        <Image
          src={user.photoURL}
          alt={user.displayName}
          ratio="16/9"
          slotProps={{
            overlay: {
              sx: (theme) => ({
                bgcolor: varAlpha(theme.vars.palette.common.blackChannel, 0.48),
              }),
            },
          }}
        />
      </Box>

      <ListItemText
        sx={{ mt: 7, mb: 1 }}
        primary={user.displayName}
        secondary={user.role}
        slotProps={{
          primary: { sx: { typography: 'subtitle1' } },
          secondary: { sx: { mt: 0.5 } },
        }}
      />

      <Box sx={{ mb: 2.5 }}>
        <Label
          variant="soft"
          color={
            (user.status === 'active' && 'success') ||
            (user.status === 'banned' && 'error') ||
            'warning'
          }
        >
          {user.status}
        </Label>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box
        sx={{
          py: 3,
          px: 2,
          gap: 1,
          display: 'flex',
          typography: 'body2',
          color: 'text.secondary',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {user.email && <Box component="span">{user.email}</Box>}
        {user.country && <Box component="span">{user.country}</Box>}
      </Box>
    </Card>
  );
}
