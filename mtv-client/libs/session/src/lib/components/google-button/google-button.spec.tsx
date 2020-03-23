import React from 'react';
import { render } from '@testing-library/react';

import GoogleButton from './google-button';

describe(' GoogleButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GoogleButton />);
    expect(baseElement).toBeTruthy();
  });
});
