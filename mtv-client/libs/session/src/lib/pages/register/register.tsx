import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { ThunkAction } from 'redux-thunk';
import { connect } from 'react-redux';
import { Action } from '@reduxjs/toolkit';

import CircularProgress from '@material-ui/core/CircularProgress';
import { Wrapper } from '../../components/wrapper/wrapper';
import { FieldWrapper } from '../../components/field-wrapper/field-wrapper';
import { FooterWrapper } from '../../components/footer-wrapper/footer-wrapper';
import { GoogleButton } from '../../components/google-button/google-button';
import { SuccessWrapper } from '../../components/success-wrapper/success-wrapper';
import { isEmail, isName } from '../../utils/validators';
import { ButtonWrapper } from '../../components/button-wrapper/button-wrapper';
import {
  postRegister,
  RegisterError,
  RegisterPayload,
  selectRegisterError,
  selectRegisterStatus,
} from '../../store/register/register.slice';

// @todo: handle error from API
export interface RegisterProps {
  status: 'loading' | 'success' | 'fail' | '';
  googleUrl: string;
  register: (data: RegisterPayload) => ThunkAction<void, RegisterPayload, null, Action>;
  error: RegisterError;
}

export interface RegisterState {
  name: string;
  nameError: boolean;
  email: string;
  emailError: boolean;
}

@(connect(
  state => ({
    status: selectRegisterStatus(state),
    googleUrl: '',
    error: selectRegisterError(state),
  }),
  dispatch => ({
    register: data => dispatch(postRegister(data)),
  }),
) as any)
export class Register extends Component<RegisterProps, RegisterState> {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
      nameError: false,
      emailError: false,
    };

    this.onNameChangeHandler = this.onNameChangeHandler.bind(this);
    this.onNameBlurHandler = this.onNameBlurHandler.bind(this);
    this.onEmailChangeHandler = this.onEmailChangeHandler.bind(this);
    this.onEmailBlurHandler = this.onEmailBlurHandler.bind(this);
    this.onFormSubmitHandler = this.onFormSubmitHandler.bind(this);
  }

  onNameChangeHandler({ target }): void {
    this.setState({
      name: target.value,
      nameError: target.value.toString().length < 3 || !isName(target.value),
    });
  }

  onNameBlurHandler(): void {
    const { name, nameError } = this.state;
    if ((name.toString().length < 3 || !isName(name)) && !nameError) {
      this.setState({
        nameError: true,
      });
    }
  }

  onEmailChangeHandler({ target }): void {
    this.setState({
      email: target.value,
      emailError: !isEmail(target.value),
    });
  }

  onEmailBlurHandler(): void {
    const { emailError, email } = this.state;
    if (!isEmail(email) && !emailError) {
      this.setState({
        emailError: true,
      });
    }
  }

  onFormSubmitHandler(event): void {
    event.preventDefault();
    this.props.register({
      email: this.state.email,
      name: this.state.name,
    });
  }

  render() {
    if (this.props.status === 'success') {
      return (
        <Wrapper success>
          <SuccessWrapper>
            <p>
              You will receive an e-mail shortly at <strong>{this.state.email}</strong> with your passkey.
            </p>
            <p>
              Please follow the instructions and then <Link to="/login">log in</Link>.
            </p>
          </SuccessWrapper>
        </Wrapper>
      );
    }

    const isLoading = this.props.status === 'loading';

    return (
      <Wrapper title="Register">
        <form onSubmit={this.onFormSubmitHandler} noValidate autoComplete="off">
          <FieldWrapper>
            <TextField
              autoFocus
              fullWidth
              required
              id="name"
              type="text"
              label="Name"
              name="new-name"
              helperText={this.state.nameError ? 'Name is required' : null}
              disabled={isLoading}
              value={this.state.name}
              error={this.state.nameError}
              onChange={this.onNameChangeHandler}
              onBlur={this.onNameBlurHandler}
            />
          </FieldWrapper>

          <FieldWrapper>
            <TextField
              fullWidth
              required
              id="email"
              label="E-mail"
              type="email"
              name="new-email"
              helperText={this.state.emailError ? 'Invalid e-mail' : null}
              disabled={isLoading}
              value={this.state.email}
              error={this.state.emailError}
              onChange={this.onEmailChangeHandler}
              onBlur={this.onEmailBlurHandler}
            />
          </FieldWrapper>
          <ButtonWrapper>
            <Button className="button" fullWidth variant="contained" disabled={isLoading} color="primary" type="submit">
              {isLoading && <CircularProgress color="secondary" size={28} />}
              <span>Register</span>
            </Button>
          </ButtonWrapper>
          <FooterWrapper>
            <p>
              Already have an account? <Link to="/login">Log in</Link>.
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
