import React, { PureComponent } from 'react';
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router';
import {
  Session,
  isUserLoggedIn,
  selectCurrentUserLoggedIn,
  selectCurrentUserLoading,
  fetchCurrentUser,
} from '@nx-react/session';
import { connect } from 'react-redux';
import { Dashboard } from '@nx-react/dashboard';

import './app.scss';

const sessionUrls = ['/login', '/register', '/reset-key'];

interface AppProps extends RouteComponentProps {
  loading: boolean;
  loggedIn: 'success' | 'fail' | '';
  fetchCurrentUser: () => void;
}

class App extends PureComponent<AppProps> {
  componentDidMount() {
    if (!isUserLoggedIn() && !sessionUrls.includes(this.props.location.pathname)) {
      this.props.history.push('/login');
      return;
    }

    this.props.fetchCurrentUser();
  }

  render() {
    if (this.props.loggedIn !== 'success') {
      return (
        <Switch>
          <Route component={Session} path="/" />
        </Switch>
      );
    }
    return (
      <Switch>
        <Route component={Dashboard} path="/" exact />
        <Route component={Dashboard} path="/experiment" />
        <Route component={Session} path="/" />
      </Switch>
    );
  }
}

export default connect(
  state => ({
    loading: selectCurrentUserLoading(state),
    loggedIn: selectCurrentUserLoggedIn(state),
  }),
  dispatch => ({
    fetchCurrentUser: () => dispatch(fetchCurrentUser()),
  }),
)(withRouter(App));
