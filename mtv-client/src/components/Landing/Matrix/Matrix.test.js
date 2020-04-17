import React from 'react';
import { Matrix } from './Matrix';
import { renderWithStore, TestWrapper } from '../../../tests/utils';

describe('Testing the matrix component', () => {
  it('Should render matrix component without crashing', () => {
    const matrixProps = {
      experiment: {
        id: '5da7cc6376e3e19307d0db64',
        project: 'SMAP',
        dataset: 'SMAP_set1',
        date_creation: '2019-10-17T02:05:23.503000',
        created_by: null,
        pipeline: 'lstm',
        dataruns: [
          {
            id: '5da7cc6576e3e19307d0db65',
            signal: 'T-1',
            events: [{ start_time: 1228219200, stop_time: 1229299200, score: 0.0336717714726245, tag: null }],
          },
        ],
      },
      tagStats: { 0: 30, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      scale: { maxTagNum: 64, maxEventNum: 10, maxScore: 1.5598205662590257 },
    };
    const mountedMatrix = renderWithStore(
      {},
      <TestWrapper>
        <Matrix {...matrixProps} />
      </TestWrapper>,
    );

    expect(mountedMatrix).toMatchSnapshot();
  });
});
