import type { PhotoItem } from 'src/types/photo';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TablePagination from '@mui/material/TablePagination';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { fData } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useGetAdminPhotos,
  adminUploadPhoto,
  adminUpdatePhoto,
  adminDeletePhoto,
  useGetAdminPhotoTags,
} from 'src/actions/photo';

import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';
import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

// ----------------------------------------------------------------------

const PHOTO_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,image/tiff,image/bmp,image/heic,image/heif,image/avif,.cr2,.cr3,.nef,.nrw,.arw,.orf,.rw2,.raf,.dng,.pef,.srw,.raw';

export function PhotoListView() {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const { photos, photosTotal, photosLoading } = useGetAdminPhotos({
    page: page + 1,
    pageSize: rowsPerPage,
  });

  const { tags } = useGetAdminPhotoTags({ pageSize: 200 });

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadTagIds, setUploadTagIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editPhoto, setEditPhoto] = useState<PhotoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const handleUploadOpen = () => {
    setUploadFiles([]);
    setUploadTitle('');
    setUploadDesc('');
    setUploadTagIds([]);
    setUploadOpen(true);
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error('请选择文件');
      return;
    }
    setUploading(true);
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', uploadTitle);
        formData.append('description', uploadDesc);
        if (uploadTagIds.length > 0) {
          formData.append('tagIds', uploadTagIds.join(','));
        }
        await adminUploadPhoto(formData);
      }
      toast.success(`${uploadFiles.length} 张照片上传成功`);
      setUploadOpen(false);
    } catch (error: any) {
      toast.error(error?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleEditOpen = (photo: PhotoItem) => {
    setEditPhoto(photo);
    setEditTitle(photo.title || '');
    setEditDesc(photo.description || '');
    setEditTagIds(photo.tags?.map((t) => t.id) || []);
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editPhoto) return;
    setEditSubmitting(true);
    try {
      await adminUpdatePhoto(editPhoto.id, {
        title: editTitle,
        description: editDesc,
        tagIds: editTagIds,
      });
      toast.success('更新成功');
      setEditOpen(false);
    } catch (error: any) {
      toast.error(error?.message || '更新失败');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      await adminDeletePhoto(id);
      toast.success('已删除');
    } catch (error: any) {
      toast.error(error?.message || '删除失败');
    }
  }, []);

  const isImagePreviewable = (mimeType: string) =>
    mimeType?.startsWith('image/') && !mimeType.includes('tiff');

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Photos"
        links={[{ name: 'Dashboard', href: paths.admin.home }, { name: 'Photos' }]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={handleUploadOpen}
          >
            Upload
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {photosLoading ? (
        <Typography>Loading...</Typography>
      ) : photos.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">No photos yet</Typography>
        </Card>
      ) : (
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          {photos.map((photo) => (
            <Grid key={photo.id} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
              <Card>
                {isImagePreviewable(photo.mimeType) ? (
                  <CardMedia
                    component="img"
                    image={photo.url}
                    alt={photo.title || photo.fileName}
                    sx={{
                      objectFit: 'cover',
                      height: { xs: 140, sm: 180, md: 200 },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: { xs: 140, sm: 180, md: 200 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                    }}
                  >
                    <Iconify icon="solar:camera-add-bold" width={48} sx={{ color: 'grey.400' }} />
                  </Box>
                )}
                <CardContent sx={{ pb: 1, px: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontSize: { xs: 13, sm: 14 } }}>
                    {photo.title || photo.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fData(photo.size)} · {fDate(photo.createdAt)}
                  </Typography>
                  {photo.tags?.length > 0 && (
                    <Box
                      sx={{
                        mt: 0.5,
                        display: { xs: 'none', sm: 'flex' },
                        gap: 0.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      {photo.tags.map((tag) => (
                        <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0, px: { xs: 0.5, sm: 1 } }}>
                  <IconButton size="small" onClick={() => handleEditOpen(photo)}>
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(photo.id)}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <TablePagination
        component="div"
        count={photosTotal}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[12, 24, 48]}
        sx={{ mt: 2 }}
      />

      {/* Upload Dialog */}
      <Dialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={smDown}
      >
        <DialogTitle>Upload Photos</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Button variant="outlined" component="label">
              选择文件 ({uploadFiles.length} 个已选)
              <input
                type="file"
                hidden
                multiple
                accept={PHOTO_ACCEPT}
                onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
              />
            </Button>
            <TextField
              label="标题"
              size="small"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
            <TextField
              label="描述"
              size="small"
              multiline
              rows={2}
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
            />
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              value={tags.filter((t) => uploadTagIds.includes(t.id))}
              onChange={(_, newValue) => setUploadTagIds(newValue.map((v) => v.id))}
              renderInput={(params) => <TextField {...params} label="标签" size="small" />}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading}>
            {uploading ? '上传中...' : '上传'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={smDown}
      >
        <DialogTitle>Edit Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="标题"
              size="small"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <TextField
              label="描述"
              size="small"
              multiline
              rows={2}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              value={tags.filter((t) => editTagIds.includes(t.id))}
              onChange={(_, newValue) => setEditTagIds(newValue.map((v) => v.id))}
              renderInput={(params) => <TextField {...params} label="标签" size="small" />}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleEditSubmit} disabled={editSubmitting}>
            {editSubmitting ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
