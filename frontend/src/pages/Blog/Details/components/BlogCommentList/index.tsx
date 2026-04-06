import type { Comment } from 'src/types/blog';

import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import { BlogCommentItem } from '../BlogCommentItem';

// ----------------------------------------------------------------------

type Props = {
  blogId: string;
  comments?: Comment[];
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
};

export function BlogCommentList({
  blogId,
  comments = [],
  total = 0,
  page = 1,
  onPageChange,
}: Props) {
  const pageCount = Math.max(1, Math.ceil(total / 10));

  return (
    <>
      {comments.map((comment) => {
        const hasReplies = !!comment.replies?.length;

        return (
          <Box key={comment.id}>
            <BlogCommentItem comment={comment} blogId={blogId} />
            {hasReplies &&
              comment.replies!.map((reply) => (
                <BlogCommentItem
                  key={reply.id}
                  comment={reply}
                  blogId={blogId}
                  hasReply
                  parentId={comment.id}
                />
              ))}
          </Box>
        );
      })}

      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, p) => onPageChange?.(p)}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            my: { xs: 5, md: 8 },
          }}
        />
      )}
    </>
  );
}
