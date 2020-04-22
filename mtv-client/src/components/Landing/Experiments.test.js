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

  const mountedExpWrapper = mountWithStore(currentState, <Experiments />);
  const expItem = mountedExpWrapper.find('.cell').first();
  it('Should handle onSelectExperiment', () => {
    const spy = jest.spyOn(actions, 'selectExperiment');

    expect(expItem.getDOMNode().classList.contains('active')).toBe(false);
    expItem.simulate('click');
    expect(spy).toHaveBeenCalled();
    expect(expItem.getDOMNode().classList.contains('active')).toBe(true);
  });

  it('Should render experiments component', () => {
    const renderedExpWrapper = renderWithStore(currentState, <Experiments />);
    expect(renderedExpWrapper).toMatchSnapshot();
  });
});
