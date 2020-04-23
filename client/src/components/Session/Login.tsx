import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FooterWrapper } from './FooterWrapper';
import { GoogleButton } from '../Common/GoogleButton';
import Wrapper from './Wrapper';
import { getLoginStatus } from '../../model/selectors/users';
import { isEmail } from '../../model/utils/Utils';

import { onUserLoginAction, googleLoginAction, fetchCurrentUserAction } from '../../model/actions/users';

export interface LoginProps {
  loginStatus: 'loading' | 'success' | 'fail' | 'authenticated';
  onUserLogin: (userData: object) => void;
  isUserLoggedIn: boolean;
  history: {
    push: (url: string) => void;
  };
  googleLogin: (userData) => void;
  fetchCurrentUser: () => void;
}

export interface LoginState {
  email: string;
  emailError: boolean;
  passkey: string;
  passkeyError: boolean;
  rememberMe: boolean;
}

class Login extends Component<LoginProps, LoginState> {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      passkey: '',
      rememberMe: false,
      emailError: false,
      passkeyError: false,
    };
    this.onFormSubmitHandler = this.onFormSubmitHandler.bind(this);
    this.onEmailChangeHandler = this.onEmailChangeHandler.bind(this);
    this.onPasskeyChangeHandler = this.onPasskeyChangeHandler.bind(this);
    this.onEmailBlurHandler = this.onEmailBlurHandler.bind(this);
    this.onPasskeyChangeHandler = this.onPasskeyChangeHandler.bind(this);
    this.onPasskeyBlurHandler = this.onPasskeyBlurHandler.bind(this);
    this.onRememberMeChangeHandler = this.onRememberMeChangeHandler.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.loginStatus === 'authenticated' && prevProps.loginStatus !== this.props.loginStatus) {
      this.props.history.push('/');
      this.props.fetchCurrentUser();
    }
  }

  onFormSubmitHandler() {
    this.props.onUserLogin({
      email: this.state.email,
      password: this.state.passkey,
      rememberMe: this.state.rememberMe,
    });
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
    this.setState((state) => ({
      rememberMe: !state.rememberMe,
    }));
  }

  render() {
    const isLoading = this.props.loginStatus === 'loading';
    return (
      <Wrapper title="Login">
        <div className="field-wrapper">
          <TextField
            autoFocus
            fullWidth
            required
            id="email"
            label="E-mail"
            type="email"
            autoComplete="new-email"
            name="new-email"
            helperText="Invalid e-mail"
            onChange={this.onEmailChangeHandler}
            value={this.state.email}
            disabled={isLoading}
            error={this.state.emailError}
            onBlur={this.onEmailBlurHandler}
          />
        </div>
        <div className="field-wrapper">
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
        </div>
        <div className="field-wrapper">
          <FormControlLabel
            className="checkbox-label"
            control={
              <Checkbox checked={this.state.rememberMe} onChange={this.onRememberMeChangeHandler} color="primary" />
            }
            label="Remember Me"
          />
        </div>
        <div className="button-wrapper">
          <Button
            className="button"
            fullWidth
            variant="contained"
            disabled={isLoading}
            color="primary"
            type="button"
            onClick={this.onFormSubmitHandler}
          >
            {isLoading && <CircularProgress color="secondary" size={28} />}
            <span>Login</span>
          </Button>
        </div>
        <FooterWrapper>
          <p>
            Don’t have an account? <Link to="/register">Register</Link>.
          </p>
        </FooterWrapper>
        <FooterWrapper>
          <p>- or -</p>
        </FooterWrapper>
        <FooterWrapper>
          <GoogleButton onUserSelect={this.props.googleLogin} text="Sign In with Google" />
        </FooterWrapper>
      </Wrapper>
    );
  }
}

export default connect(
  (state) => ({
    loginStatus: getLoginStatus(state),
  }),
  (dispatch: Function) => ({
    onUserLogin: (userData) => dispatch(onUserLoginAction(userData)),
    googleLogin: (userData) => dispatch(googleLoginAction(userData)),
    fetchCurrentUser: () => dispatch(fetchCurrentUserAction()),
  }),
)(Login);
