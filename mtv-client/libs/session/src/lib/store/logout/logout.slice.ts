import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import axios from 'axios';
import { API_URL } from '@nx-react/common';
import { SESSION_TOKEN } from '../current-user/current-user.slice';

export const LOGOUT_FEATURE_KEY = 'logout';

export type LogoutError = {
  message: string;
};

export interface LogoutState {
  loaded: boolean;
  error: LogoutError;
}

export const initialLogoutState: LogoutState = {
  loaded: false,
  error: null,
};

export const logoutSlice = createSlice({
  name: LOGOUT_FEATURE_KEY,
  initialState: initialLogoutState as LogoutState,
  reducers: {
    getLogoutStart: state => {
      state.loaded = false;
    },
    getLogoutSuccess: state => {
      state.loaded = true;
    },
    getLogoutFailure: (state, action: PayloadAction<LogoutError>) => {
      state.loaded = true;
      state.error = action.payload;
    },
  },
});

export const logoutReducer = logoutSlice.reducer;

export const { getLogoutStart, getLogoutSuccess, getLogoutFailure } = logoutSlice.actions;

export const getLogoutState = (rootState: any): LogoutState => rootState.session[LOGOUT_FEATURE_KEY];

export const selectLogoutLoaded = createSelector(
  getLogoutState,
  s => s.loaded,
);

export const selectLogoutError = createSelector(
  getLogoutState,
  s => s.error,
);

export const fetchLogout = () => async dispatch => {
  try {
    dispatch(getLogoutStart());
    const authHeader = Cookies.get(SESSION_TOKEN);

    if (!authHeader) {
      dispatch(getLogoutSuccess());

      return;
    }
    await axios.get(`${API_URL}users/signout/`, {
      headers: {
        [SESSION_TOKEN]: authHeader,
      },
    });
    Cookies.remove(SESSION_TOKEN);

    dispatch(getLogoutSuccess());
  } catch (err) {
    dispatch(getLogoutFailure(err));
  }
};
