import type { IFile, IFileFilters } from 'src/types/file';

import { useMemo, useState, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

const FILE_TYPE_OPTIONS = [
  'folder',
  'txt',
  'zip',
  'audio',
  'image',
  'video',
  'word',
  'excel',
  'powerpoint',
  'pdf',
];
import { adminDeleteUpload, useGetAdminUploads } from 'src/actions/upload';

import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';
import { EmptyContent } from 'src/components/EmptyContent';
import { ConfirmDialog } from 'src/components/CustomDialog';
import { detectFileFormat } from 'src/components/FileThumbnail';
import { useTable, rowInPage, getComparator } from 'src/components/Table';

import { FileManagerTable } from '../FileManagerTable';
import { FileManagerFilters } from '../FileManagerFilters';
import { FileManagerGridView } from '../FileManagerGridView';
import { FileManagerFiltersResult } from '../FileManagerFiltersResult';
import { FileManagerCreateFolderDialog } from '../FileManagerCreateFolderDialog';

// ----------------------------------------------------------------------

export function FileManagerView() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const dateRange = useBoolean();
  const confirmDialog = useBoolean();
  const newFilesDialog = useBoolean();

  const [displayMode, setDisplayMode] = useState('list');

  const { uploads, uploadsLoading } = useGetAdminUploads({ page: 1, pageSize: 200 });

  // Map backend uploads to IFile shape
  const tableData: IFile[] = useMemo(
    () =>
      uploads.map((item: any) => ({
        id: item.id,
        url: item.url,
        name: item.fileName,
        size: item.size,
        type: item.mimeType,
        tags: [],
        isFavorited: false,
        createdAt: item.createdAt,
        modifiedAt: item.createdAt,
        shared: null,
      })),
    [uploads]
  );

  const filters = useSetState<IFileFilters>({
    name: '',
    type: [],
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters } = filters;

  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
    dateError,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name ||
    currentFilters.type.length > 0 ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  const notFound = (!dataFiltered.length && canReset) || (!uploadsLoading && !dataFiltered.length);

  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
      if (newView !== null) {
        setDisplayMode(newView);
      }
    },
    []
  );

  const handleDeleteItem = useCallback(
    async (id: string) => {
      try {
        await adminDeleteUpload(id);
        toast.success('Delete success!');
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error(error);
        toast.error('Delete failed!');
      }
    },
    [dataInPage.length, table]
  );

  const handleDeleteItems = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => adminDeleteUpload(id)));
      toast.success('Delete success!');
      table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
    } catch (error) {
      console.error(error);
      toast.error('Delete failed!');
    }
  }, [dataFiltered.length, dataInPage.length, table]);

  const renderFilters = () => (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-end', md: 'center' },
      }}
    >
      <FileManagerFilters
        filters={filters}
        dateError={dateError}
        onResetPage={table.onResetPage}
        openDateRange={dateRange.value}
        onOpenDateRange={dateRange.onTrue}
        onCloseDateRange={dateRange.onFalse}
        options={{ types: FILE_TYPE_OPTIONS }}
      />

      <ToggleButtonGroup size="small" value={displayMode} exclusive onChange={handleChangeView}>
        <ToggleButton value="list">
          <Iconify icon="solar:list-bold" />
        </ToggleButton>

        <ToggleButton value="grid">
          <Iconify icon="mingcute:dot-grid-fill" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  const renderResults = () => (
    <FileManagerFiltersResult
      filters={filters}
      totalResults={dataFiltered.length}
      onResetPage={table.onResetPage}
    />
  );

  const renderUploadFilesDialog = () => (
    <FileManagerCreateFolderDialog open={newFilesDialog.value} onClose={newFilesDialog.onFalse} />
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteItems();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  const renderList = () =>
    displayMode === 'list' ? (
      <FileManagerTable
        table={table}
        dataFiltered={dataFiltered}
        onDeleteRow={handleDeleteItem}
        notFound={notFound}
        onOpenConfirm={confirmDialog.onTrue}
      />
    ) : (
      <FileManagerGridView
        table={table}
        dataFiltered={dataFiltered}
        onDeleteItem={handleDeleteItem}
        onOpenConfirm={confirmDialog.onTrue}
      />
    );

  return (
    <>
      <DashboardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4">File manager</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={newFilesDialog.onTrue}
          >
            Upload
          </Button>
        </Box>

        <Stack spacing={2.5} sx={{ my: { xs: 3, md: 5 } }}>
          {renderFilters()}
          {canReset && renderResults()}
        </Stack>

        {notFound ? <EmptyContent filled sx={{ py: 10 }} /> : renderList()}
      </DashboardContent>

      {renderUploadFilesDialog()}
      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  dateError: boolean;
  inputData: IFile[];
  filters: IFileFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters, dateError }: ApplyFilterProps) {
  const { name, type, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((file) => file.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (type.length) {
    inputData = inputData.filter((file) => type.includes(detectFileFormat(file.type)));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((file) => fIsBetween(file.createdAt, startDate, endDate));
    }
  }

  return inputData;
}
