import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios from '../utils/axios';
import localStorageAvailable from '../utils/localStorageAvailable';
//
import { isValidToken, setSession, setLocation } from './utils';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }

  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext(null);

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const storageAvailable = localStorageAvailable();

  const initialize = useCallback(async () => {
    try {
      const accessToken = storageAvailable ? localStorage.getItem('accessToken') : '';

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const response = await axios.get('/api/account/my-account');

        const { user } = response.data;

        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: true,
            user,
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [storageAvailable]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (location_id, temp_access_token) => {
    console.log(`this is mine selected: ${location_id} and token ${temp_access_token}`);
    const response = await axios.post('/login/location-select', {
      location_id,
      temp_access_token
    });
    const { access_token, first_name, last_name,role } = response.data;
    
    const user = {
      about: "🎩 So, next time your data syncs like a beautiful symphony, or your apps talk to each other in perfect harmony, remember the Integration Team - working in the shadows, coding with capes, and ensuring that in the digital realm of StrongroomAI, everything just... clicks!.",
      address: "123 Unicorn Way",
      city: "Giggleville",
      country: "Australia",
      displayName: first_name + ' ' + last_name,
      email: "integrations@strongroom.ai",
      id: "8864c717-587d-472a-929a-8e5f298024da-0",
      isPublic: true,
      password: "pword",
      phoneNumber: "+40 777666555",
      photoURL: "https://api-dev-minimal-v4.vercel.app/assets/images/avatars/avatar_default.jpg",
      role: "admin",
      state: "Laughterland",
      zipCode: "90210"
  };  

    console.log('this is user', user);
    console.log('This is accessToken:', access_token);

    setSession(access_token,location_id,role);

    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    });
  }, []);

  // GET LOCATION
  const getLocation = useCallback(async (name, password, company_id) => {
    console.log(`this is mine email: ${name} and password ${password} and password ${company_id}`)
    const response = await axios.post('/login', {
      name,
      password,
      company_id
    });
    const user = name;
    const { temp_access_token, locations } = response.data;
    console.log('this is user', user);
    console.log('This is temp_token and Locations:', locations, temp_access_token);


    setLocation(locations, temp_access_token);
    /*
        dispatch({
          type: 'LOGIN',
          payload: {
            user,
          },
        });
        */
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
    const response = await axios.post('/api/account/register', {
      email,
      password,
      firstName,
      lastName,
    });
    const { accessToken, user } = response.data;

    localStorage.setItem('accessToken', accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user,
      },
    });
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    setSession(null);
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      method: 'jwt',
      login,
      getLocation,
      register,
      logout,
    }),
    [state.isAuthenticated, state.isInitialized, state.user, login, getLocation, logout, register]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
