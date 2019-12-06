import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import Enzyme, { configure, mount, render, shallow } from 'enzyme';
import { configureStore } from './model/store';

configure({ adapter: new Adapter() });
Enzyme.configure({ adapter: new Adapter() });
const store = configureStore();

global.shallow = shallow;
global.render = render;
global.mount = mount;
global.store = store;

React.useLayoutEffect = React.useEffect;
