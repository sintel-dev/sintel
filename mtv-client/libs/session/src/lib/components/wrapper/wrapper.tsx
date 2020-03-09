import React, { Component } from 'react';

import image from './assets/splash-image.jpg';
import { ReactComponent as Logo } from './assets/mit-logo.svg';

import './wrapper.scss';

export interface WrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  success?: boolean;
  className?: string;
}

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
      <div className={className}>
        <div className={`${className}__body`}>
          <div className={`${className}__logo`}>
            <Logo width={110} height={110} />
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
        <div
          className={`${className}__splash`}
          style={{
            backgroundImage: `url(${image})`,
          }}
        />
      </div>
    );
  }
}

export default Wrapper;
