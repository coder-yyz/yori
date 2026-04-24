import { useState, useCallback } from 'react';
import useSWR from 'swr';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  getAdminPhotoTags,
  adminCreatePhotoTag,
  adminUpdatePhotoTag,
  adminDeletePhotoTag,
} from 'src/http';

import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';
import { Scrollbar } from 'src/components/Scrollbar';
import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

// ----------------------------------------------------------------------

export function PhotoTagListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const queryParams = { page: page + 1, pageSize: rowsPerPage, search };
  const {
    data,
    isLoading: tagsLoading,
    mutate,
  } = useSWR(['adminPhotoTags', queryParams], () => getAdminPhotoTags(queryParams), {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const tags = data?.list ?? [];
  const tagsTotal = data?.total ?? 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
  const [tagName, setTagName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingTag(null);
    setTagName('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (tag: { id: string; name: string }) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingTag(null);
    setTagName('');
  };

  const handleSubmit = async () => {
    if (!tagName.trim()) {
      toast.error('标签名不能为空');
      return;
    }
    setSubmitting(true);
    try {
      if (editingTag) {
        await adminUpdatePhotoTag(editingTag.id, { name: tagName.trim() });
        toast.success('标签已更新');
      } else {
        await adminCreatePhotoTag({ name: tagName.trim() });
        toast.success('标签已创建');
      }
      mutate();
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await adminDeletePhotoTag(id);
        toast.success('标签已删除');
        mutate();
      } catch (error: any) {
        toast.error(error?.message || '删除失败');
      }
    },
    [mutate]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Photo Tags"
        links={[
          { name: 'Dashboard', href: paths.admin.home },
          { name: 'Photos', href: paths.admin.photo.root },
          { name: 'Tags' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenCreate}
          >
            New tag
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="搜索标签..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </Box>

        <Scrollbar>
          <TableContainer sx={{ minWidth: 600 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Photos</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tagsLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : tags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      No tags found
                    </TableCell>
                  </TableRow>
                ) : (
                  tags.map((tag) => (
                    <TableRow key={tag.id} hover>
                      <TableCell>{tag.name}</TableCell>
                      <TableCell align="center">{tag.photoCount ?? 0}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit({ id: tag.id, name: tag.name })}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(tag.id)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          count={tagsTotal}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editingTag ? '编辑标签' : '创建标签'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="标签名"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '提交中...' : editingTag ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
