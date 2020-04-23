import React, { Component } from 'react';
import { connect } from 'react-redux';
import { onUserLogoutAction } from 'src/model/actions/users';
import LinearProgress from '@material-ui/core/LinearProgress';
import { getLoginStatus } from 'src/model/selectors/users';
import Wrapper from './Wrapper';

export interface LogoutProps {
  userLogout: () => void;
  loginStatus: 'loading' | 'success' | 'fail' | 'authenticated' | 'unauthenticated';
}

class Logout extends Component<LogoutProps> {
  componentDidMount() {
    this.props.userLogout();
    window.location.href = '/';
  }

  componentDidUpdate(): void {
    if (this.props.loginStatus === 'unauthenticated') {
      window.location.href = '/';
    }
  }

  render() {
    return (
      <Wrapper title="Logout" description="You will be redirected after logout.">
        <LinearProgress />
      </Wrapper>
    );
  }
}

export default connect(
  (state) => ({
    loginStatus: getLoginStatus(state),
  }),
  (dispatch: Function) => ({
    userLogout: () => dispatch(onUserLogoutAction()),
  }),
)(Logout);
