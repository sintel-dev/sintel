import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '../model/store';

export const mountWithStore = (initialState = {}, children) => global.mount(
  <Provider store={configureStore(initialState)}>
    {children}
  </Provider>);

export const renderWithStore = (initialState = {}, children) => global.render(
  <Provider store={configureStore(initialState)}>
    {children}
  </Provider>);
