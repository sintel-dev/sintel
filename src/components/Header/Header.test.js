import React from 'react';
import { shallow } from 'enzyme';
import Header from './Header';

describe('Should render header', () => {
    const header = shallow(<Header />);

    it('Renders <Header /> with enzyme', () => {
        expect(header).toMatchSnapshot();
    });
});
