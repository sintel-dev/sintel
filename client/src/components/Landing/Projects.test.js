import React from 'react';
import { RenderProject } from './Projects';
import { renderWithStore, TestWrapper } from '../../tests/utils';

describe('Projects test', () => {
  it('Should render project without crashing', () => {
    const projectProps = {
      project: {
        experimentNum: 6,
        name: 'SMAP',
        signalNum: 55,
      },
      index: 0,
    };
    const mountedPipeline = renderWithStore(
      {},
      <TestWrapper>
        <RenderProject {...projectProps} />
      </TestWrapper>,
    );
    expect(mountedPipeline).toMatchSnapshot();
  });
});
