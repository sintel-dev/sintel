import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';

import rootReducer from '../reducers';
import { api } from './middlewares';

export function configureStore(initialState = {}) {
  const middlewares = [thunkMiddleware, api];
  if (process.env.NODE_ENV !== 'test') {
    middlewares.push(createLogger({
      collapsed: true,
    }));
  }
  const composedEnhancers = composeWithDevTools(applyMiddleware(...middlewares));
  const store = createStore(rootReducer, initialState, composedEnhancers);
  return store;
}

export default configureStore();
