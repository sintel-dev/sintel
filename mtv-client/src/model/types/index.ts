import rootReducer from '../reducers/index';

export type RootState = ReturnType<typeof rootReducer>;

export * from './datarun';
