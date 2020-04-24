import React from 'react';
import { RenderPipeline } from './Pipelines';
import { renderWithStore, TestWrapper } from '../../tests/utils';

describe('Pipeline test', () => {
  it('Should render pipeline without crashing', () => {
    const pipelinesProps = {
      pipeline: {
        id: '5da7cc308c5ceceb9f28901c',
        insert_time: '2019-10-17T02:04:32.151000',
        name: 'lstm',
        created_by: null,
      },
      index: 0,
    };
    const mountedPipeline = renderWithStore(
      {},
      <TestWrapper>
        <RenderPipeline {...pipelinesProps} />
      </TestWrapper>,
    );
    expect(mountedPipeline).toMatchSnapshot();
  });
});
