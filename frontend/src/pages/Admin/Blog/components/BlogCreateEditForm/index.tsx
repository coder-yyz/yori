import type { BlogItemModel } from 'src/models';

import * as z from 'zod';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { createBlog, updateBlog, uploadFile, getAllTags, getAllCategories } from 'src/http';

import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';
import { Form, Field, schemaUtils } from 'src/components/HookForm';

import { BlogDetailsPreview } from '../BlogDetailsPreview';

// ----------------------------------------------------------------------

export type BlogCreateSchemaType = z.infer<typeof BlogCreateSchema>;

export const BlogCreateSchema = z.object({
  title: z.string().min(1, { error: '标题不能为空' }),
  description: z.string().min(1, { error: '描述不能为空' }),
  content: schemaUtils.editor().min(20, { error: '内容至少需要20个字符' }),
  contentType: z.enum(['markdown', 'html']),
  coverUrl: z.string().optional().or(z.literal('')),
  tagIds: z.string().array(),
  categoryIds: z.string().array(),
  metaKeywords: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  status: z.string(),
});

// ----------------------------------------------------------------------

type Props = {
  currentBlog?: BlogItemModel;
};

export function BlogCreateEditForm({ currentBlog }: Props) {
  const router = useRouter();

  const showPreview = useBoolean();
  const openDetails = useBoolean(true);
  const openProperties = useBoolean(true);

  const { data: tags = [] } = useSWR('allTags', getAllTags, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const { data: categories = [] } = useSWR('allCategories', getAllCategories, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const [coverUploading, setCoverUploading] = useState(false);

  const defaultValues: BlogCreateSchemaType = {
    title: currentBlog?.title || '',
    description: currentBlog?.description || '',
    content: currentBlog?.content || '',
    contentType: (currentBlog?.contentType || 'markdown') as 'html' | 'markdown',
    coverUrl: currentBlog?.coverUrl || '',
    tagIds: currentBlog?.tags?.map((t) => t.id) || [],
    categoryIds: currentBlog?.categories?.map((c) => c.id) || [],
    metaKeywords: currentBlog?.metaKeywords || '',
    metaTitle: currentBlog?.metaTitle || '',
    metaDescription: currentBlog?.metaDescription || '',
    status: currentBlog?.status || 'draft',
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(BlogCreateSchema),
    defaultValues,
    values: defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        title: data.title,
        content: data.content,
        contentType: data.contentType,
        description: data.description,
        coverUrl: data.coverUrl || '',
        status: data.status,
        tagIds: data.tagIds,
        categoryIds: data.categoryIds,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
      };

      if (currentBlog) {
        await updateBlog(currentBlog.id, payload);
        toast.success('更新成功！');
      } else {
        await createBlog(payload);
        toast.success('创建成功！');
      }

      reset();
      showPreview.onFalse();
      router.push(paths.admin.blog.root);
    } catch (error) {
      console.error(error);
      toast.error(currentBlog ? '更新失败' : '创建失败');
    }
  });

  const handleCoverDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        setCoverUploading(true);
        const result = await uploadFile(file);
        setValue('coverUrl', result.url, { shouldValidate: true });
      } catch (error) {
        console.error(error);
        toast.error('封面上传失败');
      } finally {
        setCoverUploading(false);
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('coverUrl', '');
  }, [setValue]);

  const renderCollapseButton = (value: boolean, onToggle: () => void) => (
    <IconButton onClick={onToggle}>
      <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
    </IconButton>
  );

  const renderDetails = () => (
    <Card>
      <CardHeader
        title="内容详情"
        subheader="标题、描述、正文、封面图..."
        action={renderCollapseButton(openDetails.value, openDetails.onToggle)}
        sx={{ mb: 3 }}
      />

      <Collapse in={openDetails.value}>
        <Divider />

        <Stack spacing={3} sx={{ p: 3 }}>
          <Field.Text name="title" label="博客标题" />

          <Field.Text name="description" label="博客描述" multiline rows={3} />

          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2">正文内容</Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={values.contentType}
                onChange={(_, val) => {
                  if (val) setValue('contentType', val as 'markdown' | 'html');
                }}
              >
                <ToggleButton value="markdown" sx={{ px: 1.5, py: 0.25 }}>
                  Markdown
                </ToggleButton>
                <ToggleButton value="html" sx={{ px: 1.5, py: 0.25 }}>
                  富文本
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {values.contentType === 'html' ? (
              <Field.Editor name="content" sx={{ maxHeight: 560 }} />
            ) : (
              <Field.MarkdownEditor name="content" sx={{ maxHeight: 560 }} />
            )}
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">封面图</Typography>
            <Field.Upload
              name="coverUrl"
              maxSize={5242880}
              onDrop={handleCoverDrop}
              onDelete={handleRemoveFile}
              loading={coverUploading}
            />
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderProperties = () => (
    <Card>
      <CardHeader
        title="属性设置"
        subheader="标签、分类、SEO信息..."
        action={renderCollapseButton(openProperties.value, openProperties.onToggle)}
        sx={{ mb: 3 }}
      />

      <Collapse in={openProperties.value}>
        <Divider />

        <Stack spacing={3} sx={{ p: 3 }}>
          <Field.Autocomplete
            name="tagIds"
            label="标签"
            placeholder="+ 添加标签"
            multiple
            disableCloseOnSelect
            options={tags.map((tag) => tag.id)}
            getOptionLabel={(option) => {
              const tag = tags.find((t) => t.id === option);
              return tag?.name || option;
            }}
            isOptionEqualToValue={(option, value) => option === value}
            slotProps={{
              chip: { color: 'info' },
            }}
          />

          <Field.Autocomplete
            name="categoryIds"
            label="分类"
            placeholder="+ 添加分类"
            multiple
            disableCloseOnSelect
            options={categories.map((cat) => cat.id)}
            getOptionLabel={(option) => {
              const cat = categories.find((c) => c.id === option);
              return cat?.name || option;
            }}
            isOptionEqualToValue={(option, value) => option === value}
            slotProps={{
              chip: { color: 'primary' },
            }}
          />

          <Field.Text name="metaTitle" label="SEO 标题" />

          <Field.Text name="metaDescription" label="SEO 描述" fullWidth multiline rows={3} />

          <Field.Text name="metaKeywords" label="SEO 关键词" placeholder="用逗号分隔多个关键词" />
        </Stack>
      </Collapse>
    </Card>
  );

  const renderActions = () => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <FormControlLabel
        label="发布"
        control={
          <Switch
            checked={values.status === 'published'}
            onChange={(e) => setValue('status', e.target.checked ? 'published' : 'draft')}
            slotProps={{ input: { id: 'publish-switch' } }}
          />
        }
        sx={{ pl: 3, flexGrow: 1 }}
      />

      <div>
        <Button color="inherit" variant="outlined" size="large" onClick={showPreview.onTrue}>
          预览
        </Button>

        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentBlog ? '创建博客' : '保存修改'}
        </Button>
      </div>
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={5} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails()}
        {renderProperties()}
        {renderActions()}
      </Stack>

      <BlogDetailsPreview
        isValid={isValid}
        onSubmit={onSubmit}
        title={values.title}
        open={showPreview.value}
        content={values.content}
        contentType={values.contentType}
        onClose={showPreview.onFalse}
        coverUrl={values.coverUrl || ''}
        isSubmitting={isSubmitting}
        description={values.description}
      />
    </Form>
  );
}
