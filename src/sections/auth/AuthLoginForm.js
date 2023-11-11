import { useState } from 'react';
import * as Yup from 'yup';
// next
import NextLink from 'next/link';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_AUTH } from '../../routes/paths';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// components
import Iconify from '../../components/iconify';
import FormProvider, { RHFTextField } from '../../components/hook-form';

import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Controller } from 'react-hook-form';

// ----------------------------------------------------------------------

export default function AuthLoginForm() {
  const { getLocation, login } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);

  const [locations, setLocations] = useState();

  const LoginSchema = Yup.object().shape({
    company_id: Yup.string().required('Company ID is required'),
    name: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    company_id: '87af043d-74b0-4bb4-82d8-ec418462e107',
    name: 'valeshan.naidoo@strongroom.ai',
    password: 'pword',
    location_id: ''
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await getLocation(data.name, data.password, data.company_id);
    } catch (error) {
      console.error(error);
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.message || error,
      });
    }
    // After successful login, check for 'locations' again
    const location_id = localStorage.getItem('locations');

    if (location_id) {

      const parsedLocations = JSON.parse(location_id);
      console.log('this is locations', parsedLocations);
      setLocations(parsedLocations);
      console.log("Detect Locations");

    } else {
      console.error("No Locations Detected");
      reset();
      // Handle the case where locations are not yet set
    }
  };

  const onLogin = async (data) => {
    try {
      const temp_access_token = localStorage.getItem('temp_access_token');
      console.log('this is selected location', data.location_id);
      await login(data.location_id, temp_access_token);
    } catch (error) {
      console.error(error);
      reset();
      setError('afterSubmit', {
        ...error,
        message: error.message || error,
      });
    }
  };


  if (locations) {
    console.log('this is state locations', locations);
    // Render alternative component if locations array is not empty
    return (
      <FormProvider methods={methods} onSubmit={handleSubmit(onLogin)}>

        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <FormControl fullWidth>
          <InputLabel id="location-label">Location</InputLabel>
          <Controller
            name="location_id"
            control={methods.control}
            render={({ field }) => (
              <Select
                labelId="location-label"
                label="Location"
                {...field}
                defaultValue="" // Set a default value
              >
                {Array.isArray(locations) && locations.length > 0 ? (
                  locations.map((location, index) => (
                    <MenuItem key={index} value={location.uuid}>{location.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No locations available</MenuItem>
                )}
              </Select>
            )}
          />
        </FormControl>

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          //loading={isSubmitSuccessful || isSubmitting}
          sx={{
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            },
          }}
        >
          Select
        </LoadingButton>
      </FormProvider>
    );
  }
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField name="company_id" label="Company ID" />

        <RHFTextField name="name" label="Email address" />

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack alignItems="flex-end" sx={{ my: 2 }}>
        <Link
          component={NextLink}
          href={PATH_AUTH.resetPassword}
          variant="body2"
          color="inherit"
          underline="always"
        >
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitSuccessful || isSubmitting}
        sx={{
          bgcolor: 'text.primary',
          color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          '&:hover': {
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
          },
        }}
      >
        Login
      </LoadingButton>
    </FormProvider>


  );
}
