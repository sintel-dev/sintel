import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '@nx-react/common';

export const CURRENT_USER_FEATURE_KEY = 'currentUser';
export const SESSION_TOKEN = 'AUTHORIZATION';

export type CurrentUserError = {
  message: string;
};

export interface CurrentUserEntity {
  id: number;
  name: string;
  email: string;
}

export interface CurrentUserState {
  entity: CurrentUserEntity;
  loading: boolean;
  error: CurrentUserError;
  loggedIn: 'success' | 'fail' | '';
}

export const initialCurrentUserState: CurrentUserState = {
  entity: null,
  loading: false,
  error: null,
  loggedIn: '',
};

export const currentUserSlice = createSlice({
  name: CURRENT_USER_FEATURE_KEY,
  initialState: initialCurrentUserState as CurrentUserState,
  reducers: {
    getCurrentUserStart: state => {
      state.error = null;
      state.loggedIn = '';
      state.loading = true;
    },
    getCurrentUserSuccess: state => {
      state.loading = false;
      state.loggedIn = 'success';
    },
    getCurrentUserFailure: (state, action: PayloadAction<CurrentUserError>) => {
      state.error = action.payload;
      state.loading = false;
      state.loggedIn = 'fail';
    },
  },
});

export const currentUserReducer = currentUserSlice.reducer;

export const { getCurrentUserStart, getCurrentUserSuccess, getCurrentUserFailure } = currentUserSlice.actions;

export const getCurrentUserState = (rootState: any): CurrentUserState => rootState.session[CURRENT_USER_FEATURE_KEY];

export const selectCurrentUserEntity = createSelector(
  getCurrentUserState,
  s => s.entity,
);

export const selectCurrentUserLoading = createSelector(
  getCurrentUserState,
  s => s.loading,
);

export const selectCurrentUserLoggedIn = createSelector(
  getCurrentUserState,
  s => s.loggedIn,
);

export const selectCurrentUserError = createSelector(
  getCurrentUserState,
  s => s.error,
);

export const isUserLoggedIn = () => {
  const authHeader = Cookies.get(SESSION_TOKEN);

  return !!authHeader;
};

export const fetchCurrentUser = () => dispatch => {
  try {
    dispatch(getCurrentUserStart());
    const authHeader = Cookies.get(SESSION_TOKEN);

    if (!authHeader) {
      dispatch(
        getCurrentUserFailure({
          message: '', // @todo: add message here
        }),
      );

      return;
    }

    dispatch(getCurrentUserSuccess());
  } catch (err) {
    dispatch(getCurrentUserFailure(err));
  }
};
