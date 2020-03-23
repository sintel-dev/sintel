import React from 'react';
import { render } from '@testing-library/react';

import ResetPasskey from './reset-passkey';

describe(' ResetPasskey', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ResetPasskey />);
    expect(baseElement).toBeTruthy();
  });
});
