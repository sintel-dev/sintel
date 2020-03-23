import React from 'react';
import { render } from '@testing-library/react';

import SuccessWrapper from './success-wrapper';

describe(' SuccessWrapper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SuccessWrapper />);
    expect(baseElement).toBeTruthy();
  });
});
