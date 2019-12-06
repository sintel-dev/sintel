import React from 'react';
import Enzyme, { mount } from 'enzyme';
import { Provider } from 'react-redux';
import Adapter from 'enzyme-adapter-react-16';
import Experiments from './Experiments';
import { configureStore } from '../../model/store';

Enzyme.configure({ adapter: new Adapter() });
const store = configureStore();

function setup() {
      const experimentsWrapper = mount(
        <Provider store={store}>
          <Experiments />
        </Provider>,
      );
    return {
      experimentsWrapper,
    };
  }

describe('Testing experiments component', () => {
    const { experimentsWrapper } = setup();

    it('should render experiments component', () => {
        expect(experimentsWrapper).toHaveLength(1);
    });

    it('Should render experiment title', () => {
      expect(experimentsWrapper.find('h2').text()).toBe('Experiments');
    });
});
