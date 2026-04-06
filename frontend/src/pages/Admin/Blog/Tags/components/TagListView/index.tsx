import { useState, useCallback } from 'react';

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
import { createTag, updateTag, deleteTag, useGetTags } from 'src/actions/blog';

import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';
import { Scrollbar } from 'src/components/Scrollbar';
import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

// ----------------------------------------------------------------------

export function TagListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const { tags, tagsTotal, tagsLoading } = useGetTags({
    page: page + 1,
    pageSize: rowsPerPage,
    search,
  });

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
      toast.error('Tag name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingTag) {
        await updateTag(editingTag.id, tagName.trim());
        toast.success('Tag updated!');
      } else {
        await createTag(tagName.trim());
        toast.success('Tag created!');
      }
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteTag(id);
      toast.success('Tag deleted!');
    } catch (error: any) {
      toast.error(error?.message || 'Delete failed');
    }
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Tags"
        links={[
          { name: 'Dashboard', href: paths.admin.home },
          { name: 'Blog', href: paths.admin.blog.root },
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
            placeholder="Search tags..."
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
                  <TableCell align="center">Blogs</TableCell>
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
                      <TableCell align="center">{tag.blogCount ?? 0}</TableCell>
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
        <DialogTitle>{editingTag ? 'Edit tag' : 'Create tag'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Tag name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            sx={{ mt: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {editingTag ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
