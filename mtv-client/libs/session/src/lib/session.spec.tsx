import React from 'react';
import { render } from '@testing-library/react';

import Session from './session';

describe(' Session', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Session />);
    expect(baseElement).toBeTruthy();
  });
});
