import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleWare from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import dashBoardReducers from '../reducers/index';
import { api } from './middlewares';

const loggerMiddleware = createLogger({
  collapsed: true,
});

let middleWares = [thunkMiddleWare, api, loggerMiddleware];

if (process.env.NODE_ENV === 'production') {
  middleWares = [thunkMiddleWare, api];
}

export function configureStore(initialState = {}) {
  return createStore(dashBoardReducers, initialState, composeWithDevTools(applyMiddleware(...middleWares)));
}

const store = configureStore();

export default store;
