import React from 'react';
import Header from './Header';

describe('Should render header', () => {
  const header = render(<Header />);
  it('Renders <Header /> with enzyme', () => {
    expect(header).toMatchSnapshot();
  });
});
