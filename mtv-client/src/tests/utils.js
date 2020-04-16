import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '../model/store';

export const mountWithStore = (initialState = {}, children) =>
  global.mount(<Provider store={configureStore(initialState)}>{children}</Provider>);

export const renderWithStore = (initialState = {}, children) =>
  global.render(<Provider store={configureStore(initialState)}>{children}</Provider>);

export const ConnectedTestWrapper = ({ initialState, ...props }) => (
  <Provider store={configureStore(initialState)}>
    <TestWrapper {...props} />
  </Provider>
);

export const TestWrapper = ({ children }) => <Router>{children}</Router>;
