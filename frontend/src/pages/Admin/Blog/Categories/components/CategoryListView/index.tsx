import { useState, useCallback } from 'react';

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
import { createCategory, updateCategory, deleteCategory, useGetCategories } from 'src/actions/blog';

import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';
import { Scrollbar } from 'src/components/Scrollbar';
import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

// ----------------------------------------------------------------------

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
};

const emptyForm: CategoryForm = { name: '', slug: '', description: '' };

export function CategoryListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { categories, categoriesTotal, categoriesLoading } = useGetCategories({
    page: page + 1,
    pageSize: rowsPerPage,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string } | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (cat: { id: string; name: string; slug: string; description: string }) => {
    setEditingCategory({ id: cat.id });
    setForm({ name: cat.name, slug: cat.slug || '', description: cat.description || '' });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  const handleChange = (field: keyof CategoryForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || undefined,
        });
        toast.success('Category updated!');
      } else {
        await createCategory({
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || undefined,
        });
        toast.success('Category created!');
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
      await deleteCategory(id);
      toast.success('Category deleted!');
    } catch (error: any) {
      toast.error(error?.message || 'Delete failed');
    }
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Categories"
        links={[
          { name: 'Dashboard', href: paths.admin.home },
          { name: 'Blog', href: paths.admin.blog.root },
          { name: 'Categories' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenCreate}
          >
            New category
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 600 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Blogs</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>{cat.slug}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        {cat.description
                          ? cat.description.length > 60
                            ? `${cat.description.slice(0, 60)}...`
                            : cat.description
                          : '-'}
                      </TableCell>
                      <TableCell align="center">{cat.blogCount ?? 0}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleOpenEdit({
                              id: cat.id,
                              name: cat.name,
                              slug: cat.slug || '',
                              description: cat.description || '',
                            })
                          }
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}>
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
          count={categoriesTotal}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit category' : 'Create category'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={form.name}
            onChange={handleChange('name')}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="Slug"
            value={form.slug}
            onChange={handleChange('slug')}
            placeholder="Auto-generated from name if empty"
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
