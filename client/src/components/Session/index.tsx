import React from 'react';
import { Route, Switch } from 'react-router';
import Login from './Login';
import Register from './Register';
import Logout from './Logout';
import ResetPassKey from './ResetPasskey';

const Session = () => (
  <Switch>
    <Route component={Register} exact path="/register" />
    <Route component={Logout} exact path="/logout" />
    <Route component={ResetPassKey} exact path="/reset-passkey" />
    <Route component={Login} exact path="/" />
  </Switch>
);

export default Session;
