import React from 'react';
import { render } from '@testing-library/react';

import FooterWrapper from './footer-wrapper';

describe(' FooterWrapper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FooterWrapper />);
    expect(baseElement).toBeTruthy();
  });
});
