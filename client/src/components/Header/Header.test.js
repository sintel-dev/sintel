import React from 'react';
import { render } from 'enzyme';
import { TestWrapper } from '../../tests/utils';
import { Header } from './Header';

describe('Should render header', () => {
  const selectedExperimentID = '5da7cc6376e3e19307d0db64';
  const header = render(
    <TestWrapper>
      <Header selectedExperimentID={selectedExperimentID} />
    </TestWrapper>,
  );

  it('Renders <Header /> with enzyme', () => {
    expect(header).toMatchSnapshot();
  });
});
