import React, { Component } from 'react';
import { GOOGLE_CLIEN_ID } from '@nx-react/common';
import GoogleLogin from 'react-google-login';

import './google-button.scss';

export interface GoogleButtonProps {
  text: string;
  onUserSelect?: (userData) => void;
}

export class GoogleButton extends Component<GoogleButtonProps> {
  render() {
    const responseGoogleSucces = response => {
      if (response.error) {
        return;
      }
      const { email, name, googleId, imageUrl } = response.profileObj;

      const payload = {
        email,
        name,
        gid: googleId,
        picture: imageUrl,
      };
      this.props.onUserSelect(payload);
    };
    return (
      <div className="google-login-wrapper">
        <GoogleLogin
          clientId={GOOGLE_CLIEN_ID}
          buttonText="Login"
          onSuccess={responseGoogleSucces}
          onFailure={responseGoogleSucces}
          cookiePolicy="single_host_origin"
        >
          {this.props.text}
        </GoogleLogin>
      </div>
    );
  }
}
