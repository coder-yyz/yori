import type { EditorProps } from '../Editor';

import { debounce } from 'es-toolkit';
import { Markdown } from '@tiptap/markdown';
import { common, createLowlight } from 'lowlight';
import { mergeClasses } from 'minimal-shared/utils';
import ImageExtension from '@tiptap/extension-image';
import StarterKitExtension from '@tiptap/starter-kit';
import TextAlignExtension from '@tiptap/extension-text-align';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Placeholder as PlaceholderExtension } from '@tiptap/extensions';
import CodeBlockLowlightExtension from '@tiptap/extension-code-block-lowlight';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';

import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';
import Backdrop from '@mui/material/Backdrop';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import FormHelperText from '@mui/material/FormHelperText';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { uploadFile } from 'src/http';

import { Iconify } from '../Iconify';
import { EditorRoot } from '../Editor/styles';
import { editorClasses } from '../Editor/classes';
import { Toolbar } from '../Editor/components/toolbar';
import { Markdown as MarkdownRenderer } from '../Markdown';
import { BubbleToolbar } from '../Editor/components/bubble-toolbar';
import { CodeHighlightBlock } from '../Editor/components/code-highlight-block';
import { ClearFormat as ClearFormatExtension } from '../Editor/extension/clear-format';
import { TextTransform as TextTransformExtension } from '../Editor/extension/text-transform';

// ----------------------------------------------------------------------

type ViewMode = 'editor' | 'preview' | 'split';

export type MarkdownEditorProps = Omit<EditorProps, 'ref'> & {
  onFileUpload?: (file: File) => Promise<string>;
};

export function MarkdownEditor({
  sx,
  error,
  onChange,
  slotProps,
  helperText,
  resetValue,
  className,
  editable = true,
  fullItem = false,
  immediatelyRender = false,
  onFileUpload,
  value: initialContent = '',
  placeholder = 'Write something awesome...',
  ...other
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [fullscreen, setFullscreen] = useState(false);
  const [rerenderKey, setRerenderKey] = useState(0);
  const [currentContent, setCurrentContent] = useState(initialContent);

  const lowlight = useMemo(() => createLowlight(common), []);

  const debouncedOnChange = useMemo(
    () =>
      debounce((markdown: string) => {
        setCurrentContent(markdown);
        onChange?.(markdown);
      }, 200),
    [onChange]
  );

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      if (onFileUpload) {
        return onFileUpload(file);
      }
      const result = await uploadFile(file);
      return result.url;
    },
    [onFileUpload]
  );

  const handlePaste = useCallback(
    (view: any, event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return false;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleImageUpload(file)
              .then((url) => {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src: url, alt: file.name })
                  )
                );
              })
              .catch((err) => console.error('Image upload failed:', err));
          }
          return true;
        }
      }
      return false;
    },
    [handleImageUpload]
  );

  const handleDrop = useCallback(
    (view: any, event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (!files?.length) return false;

      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          event.preventDefault();
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
          handleImageUpload(file)
            .then((url) => {
              if (pos != null) {
                const { tr } = view.state;
                view.dispatch(
                  tr.insert(pos, view.state.schema.nodes.image.create({ src: url, alt: file.name }))
                );
              }
            })
            .catch((err) => console.error('Image upload failed:', err));
          return true;
        }
      }
      return false;
    },
    [handleImageUpload]
  );

  const editor = useEditor({
    editable,
    immediatelyRender,
    content: initialContent,
    shouldRerenderOnTransaction: !!rerenderKey,
    onUpdate: (ctx) => {
      const md = ctx.editor.getMarkdown();
      debouncedOnChange(md);
    },
    editorProps: {
      handlePaste,
      handleDrop,
    },
    extensions: [
      StarterKitExtension.configure({
        codeBlock: false,
        code: { HTMLAttributes: { class: editorClasses.content.codeInline } },
        heading: { HTMLAttributes: { class: editorClasses.content.heading } },
        horizontalRule: { HTMLAttributes: { class: editorClasses.content.hr } },
        listItem: { HTMLAttributes: { class: editorClasses.content.listItem } },
        blockquote: { HTMLAttributes: { class: editorClasses.content.blockquote } },
        bulletList: { HTMLAttributes: { class: editorClasses.content.bulletList } },
        orderedList: { HTMLAttributes: { class: editorClasses.content.orderedList } },
        link: {
          openOnClick: false,
          HTMLAttributes: { class: editorClasses.content.link },
        },
      }),
      TextAlignExtension.configure({ types: ['heading', 'paragraph'] }),
      ImageExtension.configure({ HTMLAttributes: { class: editorClasses.content.image } }),
      PlaceholderExtension.configure({
        placeholder,
        emptyEditorClass: editorClasses.content.placeholder,
      }),
      CodeBlockLowlightExtension.extend({
        addNodeView: () => ReactNodeViewRenderer(CodeHighlightBlock),
      }).configure({ lowlight }),
      TextTransformExtension,
      ClearFormatExtension,
      Markdown,
    ],
    ...other,
    contentType: 'markdown',
  });

  const handleToggleFullscreen = useCallback(() => {
    editor?.unmount();
    setFullscreen((prev) => !prev);
    setRerenderKey((prev) => prev + 1);
  }, [editor]);

  const handleExitFullscreen = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        editor?.unmount();
        setFullscreen(false);
        setRerenderKey((prev) => prev + 1);
      }
    },
    [editor]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!editor?.isDestroyed && editor?.isEmpty && initialContent !== '<p></p>') {
        editor?.commands.setContent(initialContent);
        setCurrentContent(initialContent);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [initialContent, editor]);

  useEffect(() => {
    if (resetValue && !initialContent) {
      editor?.commands.clearContent();
      setCurrentContent('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]);

  useEffect(() => {
    if (!fullscreen) return undefined;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleExitFullscreen);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleExitFullscreen);
    };
  }, [fullscreen, handleExitFullscreen]);

  const handleUploadClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        try {
          const url = await handleImageUpload(file);
          editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }
    };
    input.click();
  }, [editor, handleImageUpload]);

  const renderViewModeToggle = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        px: 1,
        py: 0.5,
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ToggleButtonGroup
          size="small"
          value={viewMode}
          exclusive
          onChange={(_, val) => val && setViewMode(val)}
        >
          <ToggleButton value="editor" sx={{ px: 1.5, py: 0.5 }}>
            <Iconify icon="solar:pen-bold" width={18} sx={{ mr: 0.5 }} />
            编辑
          </ToggleButton>
          <ToggleButton value="split" sx={{ px: 1.5, py: 0.5 }}>
            <Iconify icon="solar:copy-bold" width={18} sx={{ mr: 0.5 }} />
            分屏
          </ToggleButton>
          <ToggleButton value="preview" sx={{ px: 1.5, py: 0.5 }}>
            <Iconify icon="solar:eye-bold" width={18} sx={{ mr: 0.5 }} />
            预览
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <IconButton size="small" onClick={handleUploadClick} title="上传图片">
        <Iconify icon="solar:gallery-add-bold" width={20} />
      </IconButton>
    </Box>
  );

  const showEditor = viewMode === 'editor' || viewMode === 'split';
  const showPreview = viewMode === 'preview' || viewMode === 'split';

  return (
    <Portal disablePortal={!fullscreen}>
      {fullscreen && <Backdrop open sx={[(theme) => ({ zIndex: theme.zIndex.modal - 1 })]} />}

      <Box
        {...slotProps?.wrapper}
        sx={[
          { display: 'flex', flexDirection: 'column' },
          ...(Array.isArray(slotProps?.wrapper?.sx)
            ? slotProps.wrapper.sx
            : [slotProps?.wrapper?.sx]),
        ]}
      >
        <EditorRoot
          className={mergeClasses([editorClasses.root, className], {
            [editorClasses.state.error]: !!error,
            [editorClasses.state.disabled]: !editable,
            [editorClasses.state.fullscreen]: fullscreen,
          })}
          sx={sx}
        >
          {renderViewModeToggle()}

          {editor && !editor.isDestroyed && showEditor && (
            <>
              <Toolbar
                editor={editor}
                fullItem={fullItem}
                fullscreen={fullscreen}
                onToggleFullscreen={handleToggleFullscreen}
              />
              <BubbleToolbar editor={editor} />
            </>
          )}

          <Box
            sx={{
              display: 'flex',
              flex: '1 1 auto',
              overflow: 'hidden',
              minHeight: 0,
            }}
          >
            {editor && !editor.isDestroyed && showEditor && (
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                }}
              >
                <EditorContent
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  editor={editor}
                  className={editorClasses.content.root}
                />
              </Box>
            )}

            {showPreview && (
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 2,
                  ...(viewMode === 'split' && {
                    borderLeft: (theme) => `solid 1px ${theme.vars.palette.divider}`,
                  }),
                }}
              >
                <MarkdownRenderer>{currentContent}</MarkdownRenderer>
              </Box>
            )}
          </Box>
        </EditorRoot>

        {helperText && <FormHelperText error={!!error}>{helperText}</FormHelperText>}
      </Box>
    </Portal>
  );
}
