import React from 'react';
import { Route, Switch } from 'react-router';
import { Session } from '@nx-react/session';
import { Dashboard } from '@nx-react/dashboard';

import './app.scss';

export const App = () => {
  // @todo: implement the logic to check the authorization token

  return (
    <Switch>
      <Route component={Dashboard} path="/" exact/>
      <Route component={Dashboard} path="/experiment"/>
      <Route component={Session} path="/" />
    </Switch>
  );
};

export default App;
