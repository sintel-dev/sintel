import React from 'react';
import { render } from '@testing-library/react';

import Logout from './logout';

describe(' Logout', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Logout />);
    expect(baseElement).toBeTruthy();
  });
});
