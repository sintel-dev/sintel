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
  loaded: boolean;
  error: CurrentUserError;
}

export const initialCurrentUserState: CurrentUserState = {
  entity: null,
  loaded: false,
  error: null,
};

export const currentUserSlice = createSlice({
  name: CURRENT_USER_FEATURE_KEY,
  initialState: initialCurrentUserState as CurrentUserState,
  reducers: {
    getCurrentUserStart: state => {
      state.error = null;
      state.loaded = false;
    },
    getCurrentUserSuccess: (state, action: PayloadAction<CurrentUserEntity>) => {
      state.loaded = true;
      state.entity = action.payload;
    },
    getCurrentUserFailure: (state, action: PayloadAction<CurrentUserError>) => {
      state.error = action.payload;
    },
  },
});

export const currentUserReducer = currentUserSlice.reducer;

export const { getCurrentUserStart, getCurrentUserSuccess, getCurrentUserFailure } = currentUserSlice.actions;

export const getCurrentUserState = (rootState: any): CurrentUserState => rootState[CURRENT_USER_FEATURE_KEY];

export const selectCurrentUserEntity = createSelector(
  getCurrentUserState,
  s => s.entity,
);

export const selectCurrentUserLoaded = createSelector(
  getCurrentUserState,
  s => s.loaded,
);

export const selectCurrentUserError = createSelector(
  getCurrentUserState,
  s => s.error,
);

export const fetchCurrentUser = () => async dispatch => {
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

    const response = await axios.get(`${API_URL}users/me`, {
      headers: {
        [SESSION_TOKEN]: authHeader,
      },
    });
    dispatch(getCurrentUserSuccess(response.data));
  } catch (err) {
    dispatch(getCurrentUserFailure(err));
  }
};
