import React, { Component } from 'react';

import './button-wrapper.scss';

export interface ButtonProps {
  children: React.ReactNode;
  className?: string;
}

export class ButtonWrapper extends Component<ButtonProps> {
  static defaultProps: Partial<ButtonProps> = {
    className: 'button-wrapper'
  };
  
  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>
    );
  }
}
