import React, { Component } from 'react';

import './footer-wrapper.scss';

export interface FooterWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export class FooterWrapper extends Component<FooterWrapperProps> {
  static defaultProps: Partial<FooterWrapperProps> = {
    className: 'footer-wrapper'
  };

  render() {
    return (
      <div className={`${this.props.className}`}>
        {this.props.children}
      </div>
    );
  }
}
