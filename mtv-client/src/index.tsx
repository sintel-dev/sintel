import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import { BrowserRouter, Route } from 'react-router-dom';
// import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleWare from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import dashBoardReducers from '../src/model/reducers/index';
import { api } from '../src/model/store/middlewares';
import App from './App';

// import {
//   CURRENT_USER_FEATURE_KEY,
//   currentUserReducer,
//   LOGIN_FEATURE_KEY,
//   loginReducer,
//   LOGOUT_FEATURE_KEY,
//   logoutReducer,
//   REGISTER_FEATURE_KEY,
//   registerReducer,
//   RESET_PASSKEY_FEATURE_KEY,
//   resetPasskeyReducer,
// } from '@nx-react/session';

// const store = configureStore({
//   reducer: {
//     // session: combineReducers({
//     //   [LOGIN_FEATURE_KEY]: loginReducer,
//     //   [REGISTER_FEATURE_KEY]: registerReducer,
//     //   [RESET_PASSKEY_FEATURE_KEY]: resetPasskeyReducer,
//     //   [CURRENT_USER_FEATURE_KEY]: currentUserReducer,
//     //   [LOGOUT_FEATURE_KEY]: logoutReducer,
//     // }),
//     ...dashBoardReducers,
//   },
//   middleware: [thunkMiddleware, createLogger({ collapsed: true })],
// });

const loggerMiddleware = createLogger({
  collapsed: true,
});

const middleWares = [thunkMiddleWare, api, loggerMiddleware];
const initialState = {};

const store = createStore(dashBoardReducers, initialState, composeWithDevTools(applyMiddleware(...middleWares)));
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Route path="/" component={App} />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
