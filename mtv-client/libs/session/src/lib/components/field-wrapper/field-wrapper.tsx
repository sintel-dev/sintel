import React, { Component } from 'react';

import './field-wrapper.scss';

export interface FieldWrapperProps {
  children: React.ReactNode;
  checkbox?: boolean;
  className?: string;
}

export class FieldWrapper extends Component<FieldWrapperProps> {
  static defaultProps: Partial<FieldWrapperProps> = {
    checkbox: false,
    className: 'field-wrapper',
  };

  render() {
    const { className, checkbox } = this.props;

    return <div className={`${className} ${checkbox ? `${className}--checkbox` : ''}`}>{this.props.children}</div>;
  }
}
