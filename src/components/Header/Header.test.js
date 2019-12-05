import React from 'react';
import { shallow } from 'enzyme';
import Header from './Header';

describe('Should render header', () => {
    it('Renders <Header /> with enzyme', () => {
        const header = shallow(<Header />);
        expect(header).toMatchSnapshot();

        const logo = header.find('a.logo');
        expect(header).toMatchSnapshot();
        expect(logo).toHaveLength(1);
    });
});
