import React from 'react';
import { Provider } from 'react-redux';

import Header from './components/Header/Header';
import Landing from './components/Landing/Landing';
import store from './model/store/index';

const App: React.FC = () => (
  <Provider store={store}>
    <div id="content-wrapper">
      <Header />
      <Landing />
    </div>
  </Provider>
);

export default App;
