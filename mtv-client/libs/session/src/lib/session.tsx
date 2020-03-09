import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import React from 'react';
import { Route, Switch } from 'react-router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ResetPasskey } from './pages/reset-passkey/reset-passkey';
import { Logout } from './pages/logout/logout';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#4285F4',
      contrastText: '#fff'
    },
    secondary: {
      light: '#0066ff',
      main: '#0044ff',
      contrastText: '#ffcc00'
    },
    contrastThreshold: 3,
    tonalOffset: 0.2
  }
});

export const Session = () => (
  <ThemeProvider theme={darkTheme}>
    <Switch>
      <Route component={Login} path="/login" />
      <Route component={Register} path="/register" />
      <Route component={ResetPasskey} path="/reset-passkey" />
      <Route component={Logout} path="/logout" />
    </Switch>
  </ThemeProvider>
);
