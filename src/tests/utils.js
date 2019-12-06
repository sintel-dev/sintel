import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '../model/store';

export const renderWithStore = (initialState = {}, children) => global.mount( // render
  <Provider store={configureStore(initialState)}>
    {children}
  </Provider>);
