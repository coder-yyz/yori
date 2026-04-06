import { varAlpha } from 'minimal-shared/utils';

import Paper from '@mui/material/Paper';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import Container from '@mui/material/Container';
import TimelineItem from '@mui/lab/TimelineItem';
import Typography from '@mui/material/Typography';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

import { paths } from 'src/routes/paths';

import { useGetBlogs } from 'src/actions/blog';

import { EmptyContent } from 'src/components/EmptyContent';
import { LoadingScreen } from 'src/components/LoadingScreen';

import { BlogItemCard } from '../../../components/BlogItemCard';

// ----------------------------------------------------------------------

const COLORS = [
  'inherit',
  'grey',
  'primary',
  'secondary',
  'error',
  'info',
  'success',
  'warning',
] as const;

export function TimelineView() {
  const { blogs, blogsLoading, blogsEmpty } = useGetBlogs();

  const renderLoading = () => <LoadingScreen sx={{ py: 10 }} />;

  const renderEmpty = () => <EmptyContent filled sx={{ py: 10 }} title="No blogs yet" />;

  return (
    <Container sx={{ mb: 10 }}>
      <Typography variant="h4" sx={[{ mb: 3, mt: { xs: 1, md: 3 } }]}>
        Timeline
      </Typography>

      {blogsLoading ? (
        renderLoading()
      ) : blogsEmpty ? (
        renderEmpty()
      ) : (
        <Timeline position="alternate">
          <Timeline position="alternate">
            {blogs.map((item, index) => (
              <TimelineItem key={item.id}>
                <TimelineOppositeContent>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item?.createdAt}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={COLORS[index % COLORS.length]} />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Paper
                    sx={[
                      (theme) => ({
                        p: 3,
                        bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
                      }),
                    ]}
                  >
                    <BlogItemCard blog={item} detailsHref={paths.blog.details(item.id)} />
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Timeline>
      )}
    </Container>
  );
}
