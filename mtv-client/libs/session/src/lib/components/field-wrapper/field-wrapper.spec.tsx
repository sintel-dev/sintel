import React from 'react';
import { render } from '@testing-library/react';

import { FieldWrapper } from './field-wrapper';

describe(' FieldWrapper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FieldWrapper />);
    expect(baseElement).toBeTruthy();
  });
});
