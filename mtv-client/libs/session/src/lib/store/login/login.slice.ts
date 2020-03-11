import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '@nx-react/common';
import { SESSION_TOKEN } from '../current-user/current-user.slice';

export const LOGIN_FEATURE_KEY = 'login';

export type LoginError = {
  message: string;
};

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginState {
  status: '' | 'loading' | 'success' | 'fail';
  error: LoginError;
}

export const initialLoginState: LoginState = {
  status: '',
  error: null,
};

export const loginSlice = createSlice({
  name: LOGIN_FEATURE_KEY,
  initialState: initialLoginState as LoginState,
  reducers: {
    postLoginStart: state => {
      state.status = 'loading';
      state.error = null;
    },
    postLoginSuccess: state => {
      state.status = 'success';
    },
    postLoginFailure: (state, action: PayloadAction<LoginError>) => {
      state.status = 'fail';
      state.error = action.payload;
    },
  },
});

export const loginReducer = loginSlice.reducer;

export const { postLoginStart, postLoginSuccess, postLoginFailure } = loginSlice.actions;

export const getLoginState = (rootState: any): LoginState => rootState.session[LOGIN_FEATURE_KEY];

export const selectLoginStatus = createSelector(
  getLoginState,
  s => s.status,
);

export const selectLoginError = createSelector(
  getLoginState,
  s => s.error,
);

export const googleLoginAction = userData => async dispatch => {
  const response = await axios.post(`${API_URL}auth/google_login/`, userData);
  Cookies.set(SESSION_TOKEN, response.data);
  dispatch(postLoginSuccess());
};

export const postLogin = (data: LoginPayload) => async dispatch => {
  try {
    dispatch(postLoginStart());
    const response = await axios.post(`${API_URL}users/signin/`, data);
    Cookies.set(SESSION_TOKEN, response.data.data.token, {
      expires: Date.now() + (data.rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24),
    });
    dispatch(postLoginSuccess());
  } catch (err) {
    dispatch(postLoginFailure(err));
  }
};
