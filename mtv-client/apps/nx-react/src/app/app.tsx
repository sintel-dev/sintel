import React, { PureComponent } from 'react';
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router';
import { Session, isUserLoggedIn } from '@nx-react/session';
import { Dashboard } from '@nx-react/dashboard';

import './app.scss';

const sessionUrls = ['/login', '/register', '/reset-key'];

type AppProps = RouteComponentProps;
class App extends PureComponent<AppProps> {
  componentDidMount() {
    if (!isUserLoggedIn() && !sessionUrls.includes(this.props.location.pathname)) {
      this.props.history.push('/login');
    }
  }

  render() {
    return (
      <Switch>
        <Route component={Dashboard} path="/" exact />
        <Route component={Dashboard} path="/experiment" />
        <Route component={Session} path="/" />
      </Switch>
    );
  }
}

export default withRouter(App);
