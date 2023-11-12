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

import Box from '@mui/material/Box';


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
    company_id: '31a92ddc-4d35-4ec5-b115-436362077593',
    name: 'valeshan.naidoo@strongroom.ai',
    password: 'strongroompassword',
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

    } else {
      console.error("No Locations Detected");
      reset();
      // Handle the case where locations are not yet set
    }
  };

  const methods2 = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset:reset2,
    setError:setError2,
    handleSubmit: handleSubmit2,
    formState: { errors:errors2, isSubmitting: isSubmitting2, isSubmitSuccessful: isSubmitSuccessful2 },
  } = methods2;

  const onLogin = async (data) => {
    try {
      const temp_access_token = localStorage.getItem('temp_access_token');
      console.log('this is selected location', data.location_id);
      await login(data.location_id, temp_access_token);
    } catch (error) {
      console.error(error);
      reset2();
      setError2('afterSubmit', {
        ...error,
        message: error.message || error,
      });
    }
  };


  if (locations) {
    console.log('this is state locations', locations);
    // Render alternative component if locations array is not empty
    return (
      <FormProvider methods={methods2} onSubmit={handleSubmit2(onLogin)}>
        <Stack spacing={1}>

          {!!errors2.afterSubmit && <Alert severity="error">{errors2.afterSubmit.message}</Alert>}

          <FormControl fullWidth>
            <InputLabel id="location-label">Location</InputLabel>
            <Controller
              name="location_id"
              control={methods2.control}
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
        </Stack>

        {/* Spacer element */}
        <Box sx={{ height: 24 }}></Box>

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitSuccessful2 || isSubmitting2}
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
