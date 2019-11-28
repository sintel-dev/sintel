import React from 'react';
import { Provider } from 'react-redux';

// import Experiments from './components/Experiments/Experiments';
import Header from './components/Header/Header';
import Landing from './components/Landing/Landing';
import store from './model/store/index';

const App: React.FC = () => {
  return (
    <Provider store={store}>
        <div id="content-wrapper">
          <Header />
          <Landing />
          {/* <Experiments /> */}
        </div>
    </Provider>
  );
}

export default App;
