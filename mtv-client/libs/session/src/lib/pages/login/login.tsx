import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from 'react-redux';

import { ThunkAction } from 'redux-thunk';
import { Action } from '@reduxjs/toolkit';
import { Wrapper } from '../../components/wrapper/wrapper';
import { FieldWrapper } from '../../components/field-wrapper/field-wrapper';
import { FooterWrapper } from '../../components/footer-wrapper/footer-wrapper';
import { GoogleButton } from '../../components/google-button/google-button';
import { isEmail } from '../../utils/validators';
import { ButtonWrapper } from '../../components/button-wrapper/button-wrapper';
import {
  LoginError,
  LoginPayload,
  postLogin,
  selectLoginError,
  selectLoginStatus,
} from '../../store/login/login.slice';

// @todo: handle error from API
export interface LoginProps {
  status: 'loading' | 'success' | 'fail' | '';
  googleUrl: string;
  login: (data: LoginPayload) => ThunkAction<void, LoginPayload, null, Action>;
  error: LoginError;
  history: {
    push: (url: string) => void;
  };
}

export interface LoginState {
  email: string;
  emailError: boolean;
  passkey: string;
  passkeyError: boolean;
  rememberMe: boolean;
}
@(connect(
  state => ({
    status: selectLoginStatus(state),
    googleUrl: '',
    error: selectLoginError(state),
  }),
  dispatch => ({
    login: data => dispatch(postLogin(data)),
  }),
) as any)
export class Login extends Component<LoginProps, LoginState> {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      passkey: '',
      rememberMe: false,
      emailError: false,
      passkeyError: false,
    };

    this.onEmailChangeHandler = this.onEmailChangeHandler.bind(this);
    this.onEmailBlurHandler = this.onEmailBlurHandler.bind(this);
    this.onPasskeyChangeHandler = this.onPasskeyChangeHandler.bind(this);
    this.onPasskeyBlurHandler = this.onPasskeyBlurHandler.bind(this);
    this.onRememberMeChangeHandler = this.onRememberMeChangeHandler.bind(this);
    this.onFormSubmitHandler = this.onFormSubmitHandler.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.status === 'success' && prevProps.status !== this.props.status) {
      this.props.history.push('/');
    }
  }

  onEmailChangeHandler(event): void {
    this.setState({
      email: event.target.value,
      emailError: !isEmail(event.target.value),
    });
  }

  onEmailBlurHandler(): void {
    const { email, emailError } = this.state;
    if (!isEmail(email) && !emailError) {
      this.setState({
        emailError: true,
      });
    }
  }

  onPasskeyChangeHandler(event): void {
    this.setState({
      passkey: event.target.value,
      passkeyError: event.target.value.toString().length < 3,
    });
  }

  onPasskeyBlurHandler(): void {
    const { passkeyError, passkey } = this.state;
    if (passkey.toString().length < 3 && !passkeyError) {
      this.setState({
        passkeyError: true,
      });
    }
  }

  onRememberMeChangeHandler(): void {
    this.setState(state => ({
      rememberMe: !state.rememberMe,
    }));
  }

  onFormSubmitHandler(event): void {
    event.preventDefault();

    this.props.login({
      email: this.state.email,
      password: this.state.passkey,
      rememberMe: this.state.rememberMe,
    });
  }

  render() {
    const isLoading = this.props.status === 'loading';

    return (
      <Wrapper title="Login">
        <form onSubmit={this.onFormSubmitHandler} noValidate autoComplete="off">
          <FieldWrapper>
            <TextField
              autoFocus
              fullWidth
              required
              id="email"
              label="E-mail"
              type="email"
              autoComplete="new-email"
              name="new-email"
              helperText={this.state.emailError ? 'Invalid e-mail' : null}
              disabled={isLoading}
              value={this.state.email}
              error={this.state.emailError}
              onChange={this.onEmailChangeHandler}
              onBlur={this.onEmailBlurHandler}
            />
          </FieldWrapper>

          <FieldWrapper>
            <>
              <TextField
                fullWidth
                required
                id="passkey"
                type="password"
                label="Passkey"
                autoComplete="new-password"
                name="new-password"
                helperText={this.state.passkeyError ? 'Passkey is required' : null}
                disabled={isLoading}
                value={this.state.passkey}
                error={this.state.passkeyError}
                onChange={this.onPasskeyChangeHandler}
                onBlur={this.onPasskeyBlurHandler}
              />
              {this.state.passkeyError && (
                <Link to="/reset-passkey" className="field-url">
                  Forgot Passkey?
                </Link>
              )}
            </>
          </FieldWrapper>
          <FieldWrapper checkbox>
            <FormControlLabel
              className="checkbox-label"
              control={
                <Checkbox checked={this.state.rememberMe} onChange={this.onRememberMeChangeHandler} color="primary" />
              }
              label="Remember Me"
            />
          </FieldWrapper>
          <ButtonWrapper>
            <Button className="button" fullWidth variant="contained" disabled={isLoading} color="primary" type="submit">
              {isLoading && <CircularProgress color="secondary" size={28} />}
              <span>Login</span>
            </Button>
          </ButtonWrapper>
          <FooterWrapper>
            <p>
              Don’t have an account? <Link to="/register">Register</Link>.
            </p>
          </FooterWrapper>
          {!!this.props.googleUrl && (
            <>
              <FooterWrapper>
                <p>- or -</p>
              </FooterWrapper>
              <FooterWrapper>
                <GoogleButton url={this.props.googleUrl} />
              </FooterWrapper>
            </>
          )}
        </form>
      </Wrapper>
    );
  }
}
