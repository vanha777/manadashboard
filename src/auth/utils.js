// routes
import { PATH_AUTH } from '../routes/paths';
// utils
import axios from '../utils/axios';

// ----------------------------------------------------------------------

function jwtDecode(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

// ----------------------------------------------------------------------

export const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

export const tokenExpired = (exp) => {
  // eslint-disable-next-line prefer-const
  let expiredTimer;

  const currentTime = Date.now();

  // Test token expires after 10s
  // const timeLeft = currentTime + 10000 - currentTime; // ~10s
  const timeLeft = exp * 1000 - currentTime;

  clearTimeout(expiredTimer);

  expiredTimer = setTimeout(() => {
    alert('Token expired');

    localStorage.removeItem('accessToken');

    window.location.href = PATH_AUTH.login;
  }, timeLeft);
};

// ----------------------------------------------------------------------

export const setSession = (accessToken, location_id, role) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('location_id', location_id);
    localStorage.setItem('role', JSON.stringify(role));

    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    axios.defaults.headers.common['Location'] = `${location_id}`;

    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken); // ~3 days by minimals server
    tokenExpired(exp);
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('location_id');
    localStorage.removeItem('role');
    localStorage.removeItem('temp_access_token');
    localStorage.removeItem('locations');

    delete axios.defaults.headers.common.Authorization;
    delete axios.defaults.headers.common['Location'];

  }
};

// ----------------------------------------------------------------------

export const setLocation = (locations, temp_access_token) => {
  if (locations) {
    localStorage.setItem('locations', JSON.stringify(locations));
    localStorage.setItem('temp_access_token', temp_access_token);

    //axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // This function below will handle when token is expired
    const { exp } = jwtDecode(temp_access_token); // ~3 days by minimals server
    tokenExpired(exp);

  } else {
    localStorage.removeItem('locations');

    // delete axios.defaults.headers.common.Authorization;
  }
};
