import React, { Component } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { Logo } from '../Common/Logo';
import './Login.scss';

export interface WrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  success?: boolean;
  className?: string;
}

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#4285F4',
      contrastText: '#fff',
    },
    secondary: {
      light: '#0066ff',
      main: '#0044ff',
      contrastText: '#ffcc00',
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
});

class Wrapper extends Component<WrapperProps> {
  static defaultProps = {
    title: '',
    description: '',
    className: 'session-wrapper',
    success: false,
  };

  render() {
    const { className, title, description, children } = this.props;

    return (
      <ThemeProvider theme={darkTheme}>
        <div className={className}>
          <div className={`${className}__body`}>
            <div className={`${className}__logo`}>
              <Logo />
            </div>
            <div className={`${className}__form ${this.props.success ? `${className}__form--success` : ''}`}>
              {title && (
                <div className={`${className}__header`}>
                  <div className={`${className}__title`}>{title}</div>
                  {description && <div className={`${className}__description`}>{description}</div>}
                </div>
              )}
              {children}
            </div>
          </div>
          <div className={`${className}__splash`} />
        </div>
      </ThemeProvider>
    );
  }
}

export default Wrapper;
