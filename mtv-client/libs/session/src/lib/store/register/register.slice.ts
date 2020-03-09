import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '@nx-react/common';

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
}

export const initialRegisterState: RegisterState = {
  status: '',
  error: null,
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
  },
});

export const registerReducer = registerSlice.reducer;

export const { postRegisterStart, postRegisterSuccess, postRegisterFailure } = registerSlice.actions;

export const getRegisterState = (rootState: any): RegisterState => rootState.session[REGISTER_FEATURE_KEY];

export const selectRegisterStatus = createSelector(
  getRegisterState,
  s => s.status,
);

export const selectRegisterError = createSelector(
  getRegisterState,
  s => s.error,
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
