import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';

import rootReducer from '../reducers';
import { api } from './middlewares';
import { monitorReducerEnhancer } from './enhancers';
import { State } from '../reducers/index';

export function configureStore(initialState: State = {} as any) {
  const middlewares = [thunkMiddleware, api];
  if (process.env.NODE_ENV !== 'test') {
    middlewares.push(
      createLogger({
        collapsed: true,
      }),
    );
  }
  const middlewareEnhancer = applyMiddleware(...middlewares);

  // add more Redux enhancers here if needed
  // const enhancers = [middlewareEnhancer, monitorReducerEnhancer];
  const composedEnhancers = composeWithDevTools(middlewareEnhancer);
  const store = createStore(rootReducer, initialState, composedEnhancers);
  return store;
}

export default configureStore();
