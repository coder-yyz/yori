import type { IUserItem } from 'src/types/user';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { adminUpdateUserRole, adminUpdateUserStatus } from 'src/actions/user';

import { toast } from 'src/components/Snackbar';
import { Form, Field } from 'src/components/HookForm';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'banned', label: 'Banned' },
];

const USER_ROLE_OPTIONS = [
  { value: 'root', label: 'Root' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

export type UserQuickEditSchemaType = z.infer<typeof UserQuickEditSchema>;

export const UserQuickEditSchema = z.object({
  status: z.string(),
  role: z.string().min(1, { error: 'Role is required!' }),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentUser?: IUserItem;
};

export function UserQuickEditForm({ currentUser, open, onClose }: Props) {
  const { user: currentAuthUser } = useAuthContext();
  const myRole = currentAuthUser?.role || 'user';

  // Filter role options: can only assign roles lower than own
  const roleOptions = USER_ROLE_OPTIONS.filter((opt) => {
    if (myRole === 'root') return true;
    if (myRole === 'admin') return opt.value === 'user';
    return opt.value === 'user';
  });

  const defaultValues: UserQuickEditSchemaType = {
    status: currentUser?.status || '',
    role: currentUser?.role || '',
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UserQuickEditSchema),
    defaultValues,
    values: defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentUser) return;

      if (data.role !== currentUser.role) {
        await adminUpdateUserRole(currentUser.id, data.role);
      }
      if (data.status !== currentUser.status) {
        await adminUpdateUserStatus(currentUser.id, data.status);
      }

      reset();
      onClose();
      toast.success('Update success!');
    } catch (error) {
      console.error(error);
      toast.error('Update failed!');
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { maxWidth: 480 },
        },
      }}
    >
      <DialogTitle>Quick update</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Update user role and status
          </Alert>

          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(1, 1fr)',
            }}
          >
            <Field.Select name="role" label="Role">
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="status" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            Update
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
