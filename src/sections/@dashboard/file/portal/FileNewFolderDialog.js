import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
// @mui
import {
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import { Upload } from '../../../../components/upload';

import mime from 'mime-types';

// ----------------------------------------------------------------------

FileNewFolderDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  folderName: PropTypes.string,
  onChangeFolderName: PropTypes.func,
};

export default function FileNewFolderDialog({
  title = 'Upload Files',
  open,
  onClose,
  //
  tableData,
  setTableData,
  //
  onCreate,
  onUpdate,
  //
  folderName,
  onChangeFolderName,
  ...other
}) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!open) {
      setFiles([]);
    }
  }, [open]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleUpload = () => {
    console.log('ON UPLOAD this is file that you added', files);
    //need to cretes same data structure
    const transformedArray = files.map((file, index) => ({
      //id: `file_${index}`, // Generate a unique id for each file, for example
      id: `${Math.random().toString(36).substr(2, 9)}_${file.name}`, // More unique ID
      name: file.name,
      name: file.name,
      size: file.size,
      dateCreated: new Date(), // Current date, modify as needed
      //dateModified: new Date(file.lastModified),
      dateModified: new Date(),
      isFavorited: false, // Set default value, modify as needed
      shared: [], // Array of shared details, add as needed
      tags: ["Docs", "Projects", "Work", "Training", "Sport", "Foods"], // Example tags, modify as needed
      totalFiles: 1, // Assuming each file is a single file, modify as needed
      type: mime.extension(file.type) || "unknown",
      url: file.preview,
      file: file, // Keep a reference to the original File object
    }));
    setTableData(prevTableData => [...prevTableData, ...transformedArray]);
    // console.log('ON UPLOAD this is table Date', tableData);
    console.log('ON UPLOAD this is transform array', transformedArray);
    onClose();
  };

  const handleRemoveFile = (inputFile) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}> {title} </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        {(onCreate || onUpdate) && (
          <TextField
            fullWidth
            label="Folder name"
            value={folderName}
            onChange={onChangeFolderName}
            sx={{ mb: 3 }}
          />
        )}

        <Upload multiple files={files} onDrop={handleDrop} onRemove={handleRemoveFile} />
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={handleUpload}
        >
          Upload
        </Button>

        {!!files.length && (
          <Button variant="outlined" color="inherit" onClick={handleRemoveAllFiles}>
            Remove all
          </Button>
        )}

        {(onCreate || onUpdate) && (
          <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
            <Button variant="soft" onClick={onCreate || onUpdate}>
              {onUpdate ? 'Save' : 'Create'}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}
