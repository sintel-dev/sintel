import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '@nx-react/common';

export const RESET_PASSKEY_FEATURE_KEY = 'resetPasskey';

export type ResetPasskeyError = {
  message: string;
};

export interface ResetPasskeyPayload {
  email: string;
}

export interface ResetPasskeyState {
  status: '' | 'loading' | 'success' | 'fail';
  error: ResetPasskeyError;
}

export const initialResetPasskeyState: ResetPasskeyState = {
  status: '',
  error: null,
};

export const resetPasskeySlice = createSlice({
  name: RESET_PASSKEY_FEATURE_KEY,
  initialState: initialResetPasskeyState as ResetPasskeyState,
  reducers: {
    postResetPasskeyStart: state => {
      state.status = 'loading';
      state.error = null;
    },
    postResetPasskeySuccess: state => {
      state.status = 'success';
    },
    postResetPasskeyFailure: (state, action: PayloadAction<ResetPasskeyError>) => {
      state.status = 'fail';
      state.error = action.payload;
    },
  },
});

export const resetPasskeyReducer = resetPasskeySlice.reducer;

export const { postResetPasskeyStart, postResetPasskeySuccess, postResetPasskeyFailure } = resetPasskeySlice.actions;

export const getResetPasskeyState = (rootState: any): ResetPasskeyState => rootState.session[RESET_PASSKEY_FEATURE_KEY];

export const selectResetPasskeyStatus = createSelector(
  getResetPasskeyState,
  s => s.status,
);

export const selectResetPasskeyError = createSelector(
  getResetPasskeyState,
  s => s.error,
);

export const postResetPasskey = (data: ResetPasskeyPayload) => async dispatch => {
  try {
    dispatch(postResetPasskeyStart());
    await axios.post(`${API_URL}users/reset/`, data);
    dispatch(postResetPasskeySuccess());
  } catch (err) {
    dispatch(postResetPasskeyFailure(err));
  }
};
