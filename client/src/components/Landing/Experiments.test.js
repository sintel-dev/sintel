import React from 'react';
import { Experiment } from './Experiments';
import { renderWithStore, TestWrapper } from '../../tests/utils';

jest.mock('./Matrix/Matrix', () => () => 'Matrix component');
describe('Testing experiments component ->', () => {
  const experimentsProps = {
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
    matrixScale: { maxTagNum: 64, maxEventNum: 10, maxScore: 1.5598205662590257 },
    index: 0,
    selectedPipeline: 'cyclegan',
    selectedExperiment: '5da7d1a076e3e19307d0dc19',
  };

  const mountedExperiment = renderWithStore(
    {},
    <TestWrapper>
      <Experiment {...experimentsProps} />,
    </TestWrapper>,
  );

  it('Should render experiments without crashing', () => {
    expect(mountedExperiment).toMatchSnapshot();
  });

  // @TODO - find a way to test history push
  // it('Should open experiment page when selecting experiment', () => {
  //   const mockHistory = { push: jest.fn() };
  //   const mountedExpComponent = mountWithStore(
  //     {},
  //     <TestWrapper>
  //       <Experiment {...experimentsProps} history={mockHistory} />,
  //     </TestWrapper>,
  //   );
  //   const expItem = mountedExpComponent.find('.cell.active');
  //   const spy = jest.spyOn(mockHistory, 'push');

  //   expItem.simulate('click');
  //   expect(spy).toHaveBeenCalled();
  // });
});
