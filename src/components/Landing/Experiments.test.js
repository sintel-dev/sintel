import React from 'react';
import Experiments from './Experiments';
import { experiments } from '../../tests/testmocks/experiments';
import { mountWithStore, renderWithStore } from '../../tests/utils';
import * as actions from '../../model/actions/landing';

describe('Testing experiments component', () => {
  const currentState = {
    experiments: {
      isExperimentsLoading: false,
      experimentsList: experiments,
    },
  };

  const expComponent = mountWithStore(currentState, <Experiments />);
  const expItem = expComponent.find('.cell').first();

  it('Should render experiment container', () => expect(expComponent).toHaveLength(1));
  it('Should render experiment heading', () => expect(expComponent.find('h2').text()).toBe('Experiments'));
  it('Should render pipeline name ', () => expect(expItem.find('h3').text()).toContain('lstm'));

  it('Should handle onSelectExperiment', () => {
    const spy = jest.spyOn(actions, 'selectExperiment');

    expect(expItem.getDOMNode().classList.contains('active')).toBe(false);
    expItem.simulate('click');
    expect(spy).toHaveBeenCalled();
    expect(expItem.getDOMNode().classList.contains('active')).toBe(true);
    expect(expComponent).toMatchSnapshot;
  });

  it('Should render experiments component', () => {
    const renderExpComponent = renderWithStore(currentState, <Experiments />);
    expect(renderExpComponent).toMatchSnapshot();
  });
});
