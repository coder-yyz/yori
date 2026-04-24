import type { CommentModel } from 'src/models';

import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';

import { likeComment, deleteComment } from 'src/http';

import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';

import { useAuthContext } from 'src/auth/hooks';

import { BlogCommentForm } from '../BlogCommentForm';

// ----------------------------------------------------------------------

type Props = {
  comment: CommentModel;
  blogId: string;
  hasReply?: boolean;
  parentId?: string;
};

export function BlogCommentItem({ comment, blogId, hasReply, parentId }: Props) {
  const reply = useBoolean();
  const { user: currentUser } = useAuthContext();

  const isOwner = currentUser?.id === comment.user?.id;
  const displayName = comment.user?.displayName || comment.user?.username || '匿名';

  const handleLike = async () => {
    try {
      await likeComment(comment.id);
    } catch (error) {
      console.error(error);
      toast.error('操作失败');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      toast.success('已删除');
    } catch (error) {
      console.error(error);
      toast.error('删除失败');
    }
  };

  return (
    <Box
      sx={{
        pt: 3,
        gap: 2,
        display: 'flex',
        position: 'relative',
        ...(hasReply && { pl: 8 }),
      }}
    >
      <Avatar alt={displayName} src={comment.user?.photoURL} sx={{ width: 48, height: 48 }} />

      <Box
        sx={[
          (theme) => ({
            pb: 3,
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            borderBottom: `solid 1px ${theme.vars.palette.divider}`,
          }),
        ]}
      >
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {displayName}
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {fDate(comment.createdAt)}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {comment.content}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={handleLike}>
            <Iconify icon="solar:like-bold" width={16} />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {comment.likes > 0 ? comment.likes : ''}
          </Typography>

          {isOwner && (
            <IconButton size="small" color="error" onClick={handleDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
            </IconButton>
          )}
        </Box>

        {reply.value && (
          <Box sx={{ mt: 2 }}>
            <BlogCommentForm
              blogId={blogId}
              parentId={parentId || comment.id}
              onCancel={reply.onFalse}
            />
          </Box>
        )}
      </Box>

      {!hasReply && (
        <Button
          size="small"
          color={reply.value ? 'primary' : 'inherit'}
          startIcon={<Iconify icon="solar:pen-bold" width={16} />}
          onClick={reply.onToggle}
          sx={{ right: 0, position: 'absolute' }}
        >
          回复
        </Button>
      )}
    </Box>
  );
}
