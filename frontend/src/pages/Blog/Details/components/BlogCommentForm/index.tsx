import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { createComment } from 'src/http';

import { toast } from 'src/components/Snackbar';
import { Form, Field } from 'src/components/HookForm';

// ----------------------------------------------------------------------

export type CommentSchemaType = z.infer<typeof CommentSchema>;

export const CommentSchema = z.object({
  comment: z.string().min(1, { error: 'Comment is required!' }),
});

// ----------------------------------------------------------------------

type Props = {
  blogId: string;
  parentId?: string;
  onCancel?: () => void;
};

export function BlogCommentForm({ blogId, parentId, onCancel }: Props) {
  const defaultValues: CommentSchemaType = {
    comment: '',
  };

  const methods = useForm({
    resolver: zodResolver(CommentSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createComment({
        blogId,
        content: data.comment,
        ...(parentId ? { parentId } : {}),
      });
      reset();
      onCancel?.();
      toast.success('评论成功');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : '评论失败');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
        <Field.Text
          name="comment"
          placeholder={parentId ? '回复评论...' : '写下你的评论...'}
          multiline
          rows={parentId ? 2 : 4}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
          {onCancel && (
            <Button variant="outlined" color="inherit" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {parentId ? '回复' : '发表评论'}
          </Button>
        </Box>
      </Box>
    </Form>
  );
}
