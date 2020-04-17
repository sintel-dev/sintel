import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleWare from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import dashBoardReducers from '../reducers/index';
import { api } from './middlewares';

const loggerMiddleware = createLogger({
  collapsed: true,
});

const middleWares = [thunkMiddleWare, api, loggerMiddleware];

export function configureStore(initialState = {}) {
  return createStore(dashBoardReducers, initialState, composeWithDevTools(applyMiddleware(...middleWares)));
}

const store = configureStore();

export default store;
