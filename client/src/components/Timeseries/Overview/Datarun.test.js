import React from 'react';
import { renderWithStore } from 'src/tests/utils';
import { Datarun } from './Datarun';
import * as datarun from '../../../tests/testmocks/dataRun';

jest.mock('./DrawChart', () => () => 'Draw Chart component here');
describe('Testing datarun component -> ', () => {
  const datarunProps = {
    datarun,
    selectedDatarunID: '5da80105abc56689357439e6',
    onSelectDatarun: jest.fn(),
    isEditingEventRange: false,
  };

  it('Should render datarun without crashing', () => {
    const mountedDataRun = renderWithStore({}, <Datarun {...datarunProps} />);
    expect(mountedDataRun).toMatchSnapshot();
  });

  it('Should handle Select Datarun', () => {
    const mountedDataRun = shallow(<Datarun {...datarunProps} />);
    mountedDataRun.simulate('click');
    expect(datarunProps.onSelectDatarun).toBeCalledTimes(1);
  });
});
