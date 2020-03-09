import React, { Component } from 'react';

import { ReactComponent as Logo } from './assets/google-icon.svg';

import './google-button.scss';

export interface GoogleButtonProps {
  url: string;
  className?: string;
}

export class GoogleButton extends Component<GoogleButtonProps> {
  static defaultProps: Partial<GoogleButtonProps> = {
    className: 'google-button'
  };

  render() {
    const { className } = this.props;

    return (
      <a
        className={className}
        href={this.props.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={`${className}__logo`}>
          <Logo />
        </span>
        <span className={`${className}__copy`}>Sign Up with Google</span>
      </a>
    );
  }
}
