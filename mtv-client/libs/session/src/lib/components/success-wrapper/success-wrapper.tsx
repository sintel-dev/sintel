import React, { Component } from 'react';

import './success-wrapper.scss';

export interface SuccessWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export class SuccessWrapper extends Component<SuccessWrapperProps> {
  static defaultProps: Partial<SuccessWrapperProps> = {
    className: 'success-wrapper'
  };

  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>
    );
  }
}

