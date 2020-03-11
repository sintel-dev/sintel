import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import axios from 'axios';
import { API_URL } from '@nx-react/common';
import { postLoginSuccess } from '../login/login.slice';
import { SESSION_TOKEN } from '../current-user/current-user.slice';

export const REGISTER_FEATURE_KEY = 'register';

export type RegisterError = {
  message: string;
};

export interface RegisterPayload {
  email: string;
  name: string;
}

export interface RegisterState {
  status: '' | 'loading' | 'success' | 'fail';
  error: RegisterError;
  googleRegister: '' | 'success' | 'fail';
}

export const initialRegisterState: RegisterState = {
  status: '',
  error: null,
  googleRegister: '',
};

export const registerSlice = createSlice({
  name: REGISTER_FEATURE_KEY,
  initialState: initialRegisterState as RegisterState,
  reducers: {
    postRegisterStart: state => {
      state.status = 'loading';
      state.error = null;
    },
    postRegisterSuccess: state => {
      state.status = 'success';
    },
    postRegisterFailure: (state, action: PayloadAction<RegisterError>) => {
      state.status = 'fail';
      state.error = action.payload;
    },
    postGoogleRegisterSuccess: state => {
      state.googleRegister = 'success';
    },
  },
});

export const googleRegisterAction = userData => async dispatch => {
  const response = await axios.post(`${API_URL}auth/google_login/`, userData);
  Cookies.set(SESSION_TOKEN, response.data);
  dispatch(postGoogleRegisterSuccess());
};

export const registerReducer = registerSlice.reducer;

export const {
  postRegisterStart,
  postRegisterSuccess,
  postRegisterFailure,
  postGoogleRegisterSuccess,
} = registerSlice.actions;

export const getRegisterState = (rootState: any): RegisterState => rootState.session[REGISTER_FEATURE_KEY];

export const selectRegisterStatus = createSelector(
  getRegisterState,
  s => s.status,
);

export const selectRegisterError = createSelector(
  getRegisterState,
  s => s.error,
);

export const googleRegisterStatus = createSelector(
  getRegisterState,
  s => s.googleRegister,
);

export const postRegister = (data: RegisterPayload) => async dispatch => {
  try {
    dispatch(postRegisterStart());
    await axios.post(`${API_URL}users/signup/`, data);

    dispatch(postRegisterSuccess());
  } catch (err) {
    dispatch(postRegisterFailure(err));
  }
};
