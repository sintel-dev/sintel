import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import Adapter from 'enzyme-adapter-react-16';
import Experiments from './Experiments';
import { configureStore } from '../../model/store';

Enzyme.configure({ adapter: new Adapter() });
const store = configureStore();

function setup() {
    const props = {
        addTodo: jest.fn(),
        isExperimentsLoading: false,
        filteredExperiments: jest.fn(),
        onSelectExperiment: jest.fn(),
        selectedPipeline: jest.fn(),
    };

      const experimentsWrapper = shallow(
        <Provider store={store}>
          <Experiments />
        </Provider>,
      );

    return {
      props,
      experimentsWrapper,
    };
  }

describe('Testing experiments component', () => {
    it('should render experiments component', () => {
        const { experimentsWrapper } = setup();
        expect(experimentsWrapper).toHaveLength(1);
    });
});
