import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import {
  CURRENT_USER_FEATURE_KEY,
  currentUserReducer,
  LOGIN_FEATURE_KEY,
  loginReducer,
  LOGOUT_FEATURE_KEY,
  logoutReducer,
  REGISTER_FEATURE_KEY,
  registerReducer,
  RESET_PASSKEY_FEATURE_KEY,
  resetPasskeyReducer,
} from '@nx-react/session';
import { dashboardReducers, api } from '@nx-react/dashboard';

import App from './app/app';

const store = configureStore({
  reducer: {
    session: combineReducers({
      [LOGIN_FEATURE_KEY]: loginReducer,
      [REGISTER_FEATURE_KEY]: registerReducer,
      [RESET_PASSKEY_FEATURE_KEY]: resetPasskeyReducer,
      [CURRENT_USER_FEATURE_KEY]: currentUserReducer,
      [LOGOUT_FEATURE_KEY]: logoutReducer,
    }),
    ...dashboardReducers,
  },
  middleware: [thunkMiddleware, api, createLogger({ collapsed: true })],
});

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
