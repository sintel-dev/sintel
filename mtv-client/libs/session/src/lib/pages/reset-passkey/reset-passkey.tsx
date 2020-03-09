import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ThunkAction } from 'redux-thunk';
import { Action } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { Wrapper } from '../../components/wrapper/wrapper';
import { isEmail } from '../../utils/validators';
import { SuccessWrapper } from '../../components/success-wrapper/success-wrapper';
import { FieldWrapper } from '../../components/field-wrapper/field-wrapper';
import { FooterWrapper } from '../../components/footer-wrapper/footer-wrapper';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ButtonWrapper } from '../../components/button-wrapper/button-wrapper';
import {
  postResetPasskey,
  ResetPasskeyError,
  ResetPasskeyPayload,
  selectResetPasskeyError,
  selectResetPasskeyStatus
} from '../../store/reset-passkey/reset-passkey.slice';

export interface ResetPasskeyProps {
  status: 'loading' | 'success' | 'fail' | '';
  resetPasskey: (data: ResetPasskeyPayload) => ThunkAction<void, ResetPasskeyPayload, null, Action>;
  error: ResetPasskeyError;
}

export interface ResetPasskeyState {
  email: string;
  emailError: boolean;
}

@(connect(state => ({
  status: selectResetPasskeyStatus(state),
  error: selectResetPasskeyError(state)
}), dispatch => ({
  resetPasskey: data => dispatch(postResetPasskey(data))
})) as any)
export class ResetPasskey extends Component<ResetPasskeyProps, ResetPasskeyState> {
  static defaultProps: Partial<ResetPasskeyProps> = {
    status: ''
  };

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      emailError: false
    };

    this.onEmailChangeHandler = this.onEmailChangeHandler.bind(this);
    this.onEmailBlurHandler = this.onEmailBlurHandler.bind(this);
    this.onFormSubmitHandler = this.onFormSubmitHandler.bind(this);
  }

  onEmailChangeHandler({ target }): void {
    this.setState({
      email: target.value,
      emailError: !isEmail(target.value)
    });
  }

  onEmailBlurHandler(): void {
    const { emailError, email } = this.state;
    if (!isEmail(email) && !emailError) {
      this.setState({
        emailError: true
      });
    }
  }

  onFormSubmitHandler(event): void {
    event.preventDefault();
    this.props.resetPasskey({
      email: this.state.email
    });
  }

  render() {
    if (this.props.status === 'success') {
      return (
        <Wrapper success>
          <SuccessWrapper>
            <p>If this e-mail is associated to an account, you will receive an e-mail shortly at <strong>{this.state.email}</strong> with your new passkey.</p>
            <p>Please follow the instructions and then <Link to="/login">log in</Link>.</p>
          </SuccessWrapper>
        </Wrapper>
      );
    }

    const isLoading = this.props.status === 'loading';

    return (
      <Wrapper
        title="Reset Passkey"
        description="Please enter your e-mail address to request a new passkey."
      >
        <form
          onSubmit={this.onFormSubmitHandler}
          noValidate
          autoComplete="off"
        >
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
            <Button
              className="button"
              fullWidth
              variant="contained"
              disabled={isLoading}
              color="primary"
              type="submit"
            >
              {isLoading && (
                <CircularProgress
                  color="secondary"
                  size={28}
                />
              )}
              <span>Reset Passkey</span>
            </Button>
          </ButtonWrapper>
          <FooterWrapper>
            <p>Remember passkey? <Link to="/login">Log in</Link>.</p>
          </FooterWrapper>
        </form>
      </Wrapper>
    );
  }
}

