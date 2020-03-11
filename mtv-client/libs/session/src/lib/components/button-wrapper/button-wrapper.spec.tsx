import React from 'react';
import { render } from '@testing-library/react';

import { ButtonWrapper } from './button-wrapper';

describe(' ButtonWrapper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ButtonWrapper />);
    expect(baseElement).toBeTruthy();
  });
});
