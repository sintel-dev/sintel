import React, { Component } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import { connect } from 'react-redux';
import { ThunkAction } from 'redux-thunk';
import { Action } from '@reduxjs/toolkit';

import { Wrapper } from '../../components/wrapper/wrapper';
import { fetchLogout, selectLogoutLoaded } from '../../store/logout/logout.slice';

export interface LogoutProps {
  loaded: boolean;
  logout: () => ThunkAction<void, void, null, Action>;
}

@(connect(
  state => ({
    loaded: selectLogoutLoaded(state),
  }),
  dispatch => ({
    logout: () => dispatch(fetchLogout()),
  }),
) as any)
export class Logout extends Component<LogoutProps> {
  componentDidMount(): void {
    this.props.logout();
  }

  componentDidUpdate(): void {
    if (this.props.loaded) {
      window.location.href = '/login';
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
