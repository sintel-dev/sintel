import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import sinon from 'sinon';
import Header from './Header';

configure({ adapter: new Adapter() });

describe('Should render header', () => {
    const header = shallow(<Header />);

    it('Renders <Header /> with enzyme', () => {
        expect(header).toMatchSnapshot();
    });

    it('Renders the logo and page switch button', () => {
        expect(header.children().find('.logo')).toHaveLength(1);
        expect(header.children().find('.page-switch-btn')).toHaveLength(1);
    });
});
