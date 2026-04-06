import type { IUserItem } from 'src/types/user';

import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { uploadFile } from 'src/actions/blog';
import {
  adminCreateUser,
  adminDeleteUser,
  adminUpdateUserRole,
  adminUpdateUserStatus,
} from 'src/actions/user';

import { Label } from 'src/components/Label';
import { toast } from 'src/components/Snackbar';
import { Form, Field } from 'src/components/HookForm';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const USER_ROLE_OPTIONS = [
  { value: 'root', label: 'Root' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

// Schema for edit mode
export type UserEditSchemaType = z.infer<typeof UserEditSchema>;
export const UserEditSchema = z.object({
  role: z.string().min(1, { error: 'Role is required!' }),
  status: z.string(),
});

// Schema for create mode
export type UserCreateSchemaType = z.infer<typeof UserCreateSchema>;
export const UserCreateSchema = z.object({
  username: z.string().min(3, { error: 'Username must be at least 3 characters' }),
  email: z.string().email({ error: 'Invalid email' }),
  password: z.string().min(6, { error: 'Password must be at least 6 characters' }),
  displayName: z.string().optional(),
  photoURL: z.any().optional(),
  role: z.string().min(1, { error: 'Role is required!' }),
});

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
};

export function UserCreateEditForm({ currentUser }: Props) {
  if (currentUser) {
    return <UserEditForm currentUser={currentUser} />;
  }

  return <UserCreateForm />;
}

// ----------------------------------------------------------------------
// Create Form
// ----------------------------------------------------------------------

function UserCreateForm() {
  const router = useRouter();
  const { user: currentAuthUser } = useAuthContext();
  const myRole = currentAuthUser?.role || 'user';

  // Filter role options: can only create roles lower than own
  const roleOptions = USER_ROLE_OPTIONS.filter((opt) => {
    if (myRole === 'root') return true; // root can create any role
    if (myRole === 'admin') return opt.value === 'user';
    return opt.value === 'user';
  });

  const methods = useForm<UserCreateSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(UserCreateSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      displayName: '',
      photoURL: null,
      role: 'user',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      let photoURL = '';

      // If photoURL is a File, upload it first
      if (data.photoURL instanceof File) {
        const uploaded = await uploadFile(data.photoURL);
        photoURL = uploaded.url;
      }

      await adminCreateUser({
        username: data.username,
        email: data.email,
        password: data.password,
        displayName: data.displayName || undefined,
        photoURL: photoURL || undefined,
        role: data.role,
      });
      toast.success('User created successfully!');
      router.push(paths.admin.user.list);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Create failed!');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <Field.UploadAvatar
              name="photoURL"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="username" label="Username" />
              <Field.Text name="email" label="Email address" />
              <Field.Text name="password" label="Password" type="password" />
              <Field.Text name="displayName" label="Display name" />

              <Field.Select name="role" label="Role">
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting}>
                Create user
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}

// ----------------------------------------------------------------------
// Edit Form
// ----------------------------------------------------------------------

function UserEditForm({ currentUser }: { currentUser: IUserItem }) {
  const router = useRouter();
  const { user: currentAuthUser } = useAuthContext();
  const myRole = currentAuthUser?.role || 'user';

  // Filter role options based on caller's role
  const roleOptions = USER_ROLE_OPTIONS.filter((opt) => {
    if (myRole === 'root') return true;
    if (myRole === 'admin') return opt.value === 'user';
    return opt.value === 'user';
  });

  // Can this user be managed by the current user?
  const ROLE_LEVELS: Record<string, number> = { root: 3, admin: 2, user: 1 };
  const canManage = (ROLE_LEVELS[myRole] || 0) > (ROLE_LEVELS[currentUser.role] || 0);

  const defaultValues: UserEditSchemaType = {
    role: currentUser.role || 'user',
    status: currentUser.status || 'active',
  };

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(UserEditSchema),
    defaultValues,
    values: defaultValues,
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.role !== currentUser.role) {
        await adminUpdateUserRole(currentUser.id, data.role);
      }
      if (data.status !== currentUser.status) {
        await adminUpdateUserStatus(currentUser.id, data.status);
      }

      toast.success('Update success!');
      router.push(paths.admin.user.list);
    } catch (error) {
      console.error(error);
      toast.error('Update failed!');
    }
  });

  const handleDelete = async () => {
    try {
      await adminDeleteUser(currentUser.id);
      toast.success('Delete success!');
      router.push(paths.admin.user.list);
    } catch (error) {
      console.error(error);
      toast.error('Delete failed!');
    }
  };

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <Label
              color={
                (values.status === 'active' && 'success') ||
                (values.status === 'banned' && 'error') ||
                'warning'
              }
              sx={{ position: 'absolute', top: 24, right: 24 }}
            >
              {values.status}
            </Label>

            <Box sx={{ mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                component="img"
                src={currentUser.photoURL || '/assets/icons/ic-user.svg'}
                alt={currentUser.displayName}
                sx={{ width: 128, height: 128, borderRadius: '50%', objectFit: 'cover' }}
              />
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                {currentUser.displayName || currentUser.username}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                @{currentUser.username}
              </Typography>
            </Box>

            <FormControlLabel
              labelPlacement="start"
              disabled={!canManage}
              control={
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value !== 'active'}
                      onChange={(event) =>
                        field.onChange(event.target.checked ? 'banned' : 'active')
                      }
                    />
                  )}
                />
              }
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Banned
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Apply disable account
                  </Typography>
                </>
              }
              sx={{
                mx: 0,
                mb: 3,
                width: 1,
                justifyContent: 'space-between',
              }}
            />

            <Stack sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
              {canManage && (
                <Button variant="soft" color="error" onClick={handleDelete}>
                  Delete user
                </Button>
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text
                name="username"
                label="Username"
                value={currentUser.username}
                slotProps={{ input: { readOnly: true } }}
              />
              <Field.Text
                name="email"
                label="Email address"
                value={currentUser.email}
                slotProps={{ input: { readOnly: true } }}
              />
              <Field.Text
                name="displayName"
                label="Display name"
                value={currentUser.displayName || ''}
                slotProps={{ input: { readOnly: true } }}
              />
              <Field.Text
                name="phoneNumber"
                label="Phone number"
                value={currentUser.phoneNumber || ''}
                slotProps={{ input: { readOnly: true } }}
              />
              <Field.Text
                name="country"
                label="Country"
                value={currentUser.country || ''}
                slotProps={{ input: { readOnly: true } }}
              />
              <Field.Text
                name="city"
                label="City"
                value={currentUser.city || ''}
                slotProps={{ input: { readOnly: true } }}
              />

              <Field.Select name="role" label="Role" disabled={!canManage}>
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Box>

            {currentUser.about && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  About
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {currentUser.about}
                </Typography>
              </Box>
            )}

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              {canManage && (
                <Button type="submit" variant="contained" loading={isSubmitting}>
                  Save changes
                </Button>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
