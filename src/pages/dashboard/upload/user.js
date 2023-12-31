import { useState } from 'react';
// next
import Head from 'next/head';
// @mui
import { Stack, Button, Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// utils
import { fTimestamp } from '../../../utils/formatTime';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// _mock_
import { _allFiles } from '../../../_mock/arrays';
// components
import Iconify from '../../../components/iconify';
import ConfirmDialog from '../../../components/confirm-dialog';
import { fileFormat } from '../../../components/file-thumbnail';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../../components/settings';
import { useTable, getComparator } from '../../../components/table';
import DateRangePicker, { useDateRangePicker } from '../../../components/date-range-picker';
// sections
import {
  FileListView,
  FileGridView,
  FileFilterType,
  FileFilterName,
  FileFilterButton,
  FileChangeViewButton,
  FileNewFolderDialog,
} from '../../../sections/@dashboard/file';

// utils
import axios from '../../../utils/axios';

import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// ----------------------------------------------------------------------

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
  'photoshop',
  'illustrator',
];

// ----------------------------------------------------------------------

UploadUserPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function UploadUserPage() {
  const table = useTable({ defaultRowsPerPage: 10 });

  const {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    open: openPicker,
    onOpen: onOpenPicker,
    onClose: onClosePicker,
    onReset: onResetPicker,
    isSelected: isSelectedValuePicker,
    isError,
    shortLabel,
  } = useDateRangePicker(null, null);

  const { themeStretch } = useSettingsContext();

  const [view, setView] = useState('list');

  const [filterName, setFilterName] = useState('');

  //const [tableData, setTableData] = useState(_allFiles);
  const [tableData, setTableData] = useState([]);

  const [filterType, setFilterType] = useState([]);

  const [openConfirm, setOpenConfirm] = useState(false);

  //upload
  const [openUpload, setOpenUpload] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [dialogContent, setDialogContent] = useState(`Are you sure want to upload to StrongroomAi Databases?`);
  //end.

  const [openUploadFile, setOpenUploadFile] = useState(false);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterType,
    filterStartDate: startDate,
    filterEndDate: endDate,
    isError: !!isError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterType) ||
    (!dataFiltered.length && !!endDate && !!startDate);

  const isFiltered = !!filterName || !!filterType.length || (!!startDate && !!endDate);

  const handleChangeView = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleFilterName = (event) => {
    table.setPage(0);
    setFilterName(event.target.value);
  };

  const handleChangeStartDate = (newValue) => {
    table.setPage(0);
    onChangeStartDate(newValue);
  };

  const handleChangeEndDate = (newValue) => {
    table.setPage(0);
    onChangeEndDate(newValue);
  };

  const handleFilterType = (type) => {
    const checked = filterType.includes(type)
      ? filterType.filter((value) => value !== type)
      : [...filterType, type];

    table.setPage(0);
    setFilterType(checked);
  };

  const handleDeleteItem = (id) => {
    const { page, setPage, setSelected } = table;
    const deleteRow = tableData.filter((row) => row.id !== id);
    setSelected([]);
    setTableData(deleteRow);

    if (page > 0) {
      if (dataInPage.length < 2) {
        setPage(page - 1);
      }
    }
  };

  const handleDeleteItems = (selected) => {
    const { page, rowsPerPage, setPage, setSelected } = table;
    const deleteRows = tableData.filter((row) => !selected.includes(row.id));
    setSelected([]);
    setTableData(deleteRows);

    if (page > 0) {
      if (selected.length === dataInPage.length) {
        setPage(page - 1);
      } else if (selected.length === dataFiltered.length) {
        setPage(0);
      } else if (selected.length > dataInPage.length) {
        const newPage = Math.ceil((tableData.length - selected.length) / rowsPerPage) - 1;
        setPage(newPage);
      }
    }
  };

  //upload
  const handleUploadItems = (selected) => {
    setIsLoading(true);
    const { page, rowsPerPage, setPage, setSelected } = table;
    const selectedFiles = tableData.filter((row) => selected.includes(row.id));
    //setloading
    //handleOpenUpload
    //setTableData(deleteRows);
    console.log('this is upload to kraken', selectedFiles);

    const formData = new FormData();
    selectedFiles.forEach((selectedFile, index) => {
      // Append each file object to the FormData
      // The 'files[]' is the name of the form field that your server expects
      // Modify it according to your server's requirements
      //formData.append(`[${selectedFile.name}]`, selectedFile.file);
      formData.append(`[${selectedFile.name}]`, selectedFile.file);
    });

    console.log('this is what is sent', formData);

    axios.post("/api/upload-user", formData)
      .then(response => {
        setSelected([]);
        console.log('Upload successful', response.data);
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);

        setDialogContent(
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            <Typography variant="h5" component="div" sx={{ mt: 2 }}>
              Hooray! Upload successful!
            </Typography>
          </>
        );
      })
      .catch(error => {
        // set error
        console.error('Upload failed', error);

        setTimeout(() => {
          setIsLoading(false);
        }, 2000);

        setDialogContent(
          <>
            <ErrorIcon color="error" sx={{ fontSize: 40 }} />
            <Typography variant="h5" component="div" sx={{ mt: 2, color: 'error.main' }}>
              Oops! Something went wrong.
            </Typography>
            {/* Optionally, include error details */}
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              {error}
            </Typography>
          </>
        );
      });

    /*
        if (page > 0) {
           console.log('selected file')
          if (selected.length === dataInPage.length) {
            setPage(page - 1);
          } else if (selected.length === dataFiltered.length) {
            setPage(0);
          } else if (selected.length > dataInPage.length) {
            const newPage = Math.ceil((tableData.length - selected.length) / rowsPerPage) - 1;
            setPage(newPage);
          }
        }
    */

  };
  //end.

  const handleClearAll = () => {
    if (onResetPicker) {
      onResetPicker();
    }
    setFilterName('');
    setFilterType([]);
  };

  //upload file
  const handleOpenUpload = () => {
    setOpenUpload(true);
  };

  const handleCloseUpload = () => {
    setOpenUpload(false);
  };
  //end.

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenUploadFile = () => {
    setOpenUploadFile(true);
  };

  const handleCloseUploadFile = () => {
    setOpenUploadFile(false);
  };

  return (
    <>
      <Head>
        <title> User Upload </title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="User Upload"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Upload',
              href: PATH_DASHBOARD.upload.root,
            },
            { name: 'User Upload' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={handleOpenUploadFile}
            >
              Add File
            </Button>
          }
        />

        <Stack
          spacing={2.5}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 5 }}
        >
          <Stack
            spacing={1}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ md: 'center' }}
            sx={{ width: 1 }}
          >
            <FileFilterName filterName={filterName} onFilterName={handleFilterName} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <>
                <FileFilterButton
                  isSelected={!!isSelectedValuePicker}
                  startIcon={<Iconify icon="eva:calendar-fill" />}
                  onClick={onOpenPicker}
                >
                  {isSelectedValuePicker ? shortLabel : 'Select Date'}
                </FileFilterButton>

                <DateRangePicker
                  variant="calendar"
                  startDate={startDate}
                  endDate={endDate}
                  onChangeStartDate={handleChangeStartDate}
                  onChangeEndDate={handleChangeEndDate}
                  open={openPicker}
                  onClose={onClosePicker}
                  isSelected={isSelectedValuePicker}
                  isError={isError}
                />
              </>

              <FileFilterType
                filterType={filterType}
                onFilterType={handleFilterType}
                optionsType={FILE_TYPE_OPTIONS}
                onReset={() => setFilterType([])}
              />

              {isFiltered && (
                <Button
                  variant="soft"
                  color="error"
                  onClick={handleClearAll}
                  startIcon={<Iconify icon="eva:trash-2-outline" />}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>

          <FileChangeViewButton value={view} onChange={handleChangeView} />
        </Stack>

        {view === 'list' ? (
          <FileListView
            table={table}
            tableData={tableData}
            dataFiltered={dataFiltered}
            onDeleteRow={handleDeleteItem}
            isNotFound={isNotFound}
            onOpenConfirm={handleOpenConfirm}
            onOpenUpload={handleOpenUpload}
          />
        ) : (
          <FileGridView
            table={table}
            data={tableData}
            dataFiltered={dataFiltered}
            onDeleteItem={handleDeleteItem}
            onOpenConfirm={handleOpenConfirm}
            onOpenUpload={handleOpenUpload}
          />
        )}
      </Container>

      <FileNewFolderDialog open={openUploadFile} onClose={handleCloseUploadFile} tableData={tableData} setTableData={setTableData} />

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
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
              handleDeleteItems(table.selected);
              handleCloseConfirm();
            }}
          >
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={openUpload}
        onClose={handleCloseUpload}
        title="Upload"
        content={<>{dialogContent}</>}
        action={
          <LoadingButton
            variant="contained"
            color="success"
            onClick={() => {
              handleUploadItems(table.selected);
              //handleCloseUpload();
            }}
            loading={isLoading}
          >
            Upload
          </LoadingButton>
        }
      />

    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterType,
  filterStartDate,
  filterEndDate,
  isError,
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (file) => file.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterType.length) {
    inputData = inputData.filter((file) => filterType.includes(fileFormat(file.type)));
  }

  if (filterStartDate && filterEndDate && !isError) {
    inputData = inputData.filter(
      (file) =>
        fTimestamp(file.dateCreated) >= fTimestamp(filterStartDate) &&
        fTimestamp(file.dateCreated) <= fTimestamp(filterEndDate)
    );
  }

  return inputData;
}
