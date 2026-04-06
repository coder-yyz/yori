import type { MarkdownEditorProps } from '../MarkdownEditor';

import { Controller, useFormContext } from 'react-hook-form';

import { MarkdownEditor } from '../MarkdownEditor';

// ----------------------------------------------------------------------

export type RHFMarkdownEditorProps = MarkdownEditorProps & {
  name: string;
};

export function RHFMarkdownEditor({ name, helperText, ...other }: RHFMarkdownEditorProps) {
  const {
    control,
    formState: { isSubmitSuccessful },
  } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <MarkdownEditor
          {...field}
          error={!!error}
          helperText={error?.message ?? helperText}
          resetValue={isSubmitSuccessful}
          {...other}
        />
      )}
    />
  );
}
