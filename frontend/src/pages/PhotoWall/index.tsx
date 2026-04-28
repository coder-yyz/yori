import type { PhotoTagModel } from 'src/models';

import useSWR from 'swr';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Masonry from '@mui/lab/Masonry';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { getAllPublicPhotos, getAllPublicPhotoTags } from 'src/http';

import { Lightbox, useLightbox } from 'src/components/Lightbox';

// ----------------------------------------------------------------------

export default function PhotoWall() {
  const [selectedTag, setSelectedTag] = useState<string>('');

  const { data: tagsData } = useSWR('publicPhotoTags', getAllPublicPhotoTags, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const tags = tagsData ?? [];
  const { data: photosData, isLoading: photosLoading } = useSWR(
    ['publicPhotos', selectedTag],
    () => getAllPublicPhotos(selectedTag || undefined),
    { revalidateIfStale: false, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
  const photos = photosData ?? [];

  const slides = photos
    .filter((p) => p.mimeType?.startsWith('image/') && !p.mimeType.includes('tiff'))
    .map((p) => ({ src: p.url }));

  const lightbox = useLightbox(slides);

  const handleTagClick = (tag: PhotoTagModel) => {
    setSelectedTag((prev) => (prev === tag.id ? '' : tag.id));
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 5, md: 10 }, px: { xs: 2, sm: 3 } }}
    >
      <Typography
        variant="h3"
        sx={{ mb: { xs: 1.5, md: 2 }, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
      >
        Photo Wall
      </Typography>

      {tags.length > 0 && (
        <Stack
          direction="row"
          sx={{
            mb: { xs: 2.5, md: 4 },
            flexWrap: 'wrap',
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          <Chip
            label="All"
            size="small"
            variant={selectedTag === '' ? 'filled' : 'outlined'}
            color={selectedTag === '' ? 'primary' : 'default'}
            onClick={() => setSelectedTag('')}
            sx={{ fontSize: { xs: 12, sm: 13 } }}
          />
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              label={`${tag.name}${tag.photoCount ? ` (${tag.photoCount})` : ''}`}
              size="small"
              variant={selectedTag === tag.id ? 'filled' : 'outlined'}
              color={selectedTag === tag.id ? 'primary' : 'default'}
              onClick={() => handleTagClick(tag)}
              sx={{ fontSize: { xs: 12, sm: 13 } }}
            />
          ))}
        </Stack>
      )}

      {photosLoading ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 10 }}>
          Loading...
        </Typography>
      ) : photos.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 10 }}>
          No photos yet
        </Typography>
      ) : (
        <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={{ xs: 1, sm: 1.5, md: 2 }}>
          {photos.map((photo) => {
            const isPreviewable =
              photo.mimeType?.startsWith('image/') && !photo.mimeType.includes('tiff');
            return (
              <Box
                key={photo.id}
                sx={{
                  borderRadius: { xs: 1.5, sm: 2 },
                  overflow: 'hidden',
                  cursor: isPreviewable ? 'pointer' : 'default',
                  position: 'relative',
                  '&:hover .photo-overlay': { opacity: 1 },
                  // 触屏设备始终显示 overlay
                  '@media (hover: none)': {
                    '& .photo-overlay': { opacity: 1 },
                  },
                }}
                onClick={() => {
                  if (isPreviewable) lightbox.onOpen(photo.url);
                }}
              >
                {isPreviewable ? (
                  <Box
                    component="img"
                    src={photo.url}
                    alt={photo.title || photo.fileName}
                    loading="lazy"
                    sx={{
                      width: '100%',
                      display: 'block',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'scale(1.03)' },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: { xs: 150, sm: 200 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.200',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {photo.fileName}
                    </Typography>
                  </Box>
                )}

                {/* Hover Overlay (touch 设备常显) */}
                {(photo.title || photo.tags?.length > 0) && (
                  <Box
                    className="photo-overlay"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: { xs: 1, sm: 1.5 },
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                      color: 'common.white',
                    }}
                  >
                    {photo.title && (
                      <Typography variant="subtitle2" noWrap sx={{ fontSize: { xs: 12, sm: 14 } }}>
                        {photo.title}
                      </Typography>
                    )}
                    {photo.tags?.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}
                      >
                        {photo.tags.map((tag) => (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                            sx={{
                              color: 'common.white',
                              borderColor: 'rgba(255,255,255,0.5)',
                              height: { xs: 18, sm: 22 },
                              fontSize: { xs: 10, sm: 11 },
                            }}
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Masonry>
      )}

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </Container>
  );
}
