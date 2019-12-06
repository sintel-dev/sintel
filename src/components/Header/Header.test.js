import React from 'react';
import Header from './Header';

describe('Should render header', () => {
    it('Renders <Header /> with enzyme', () => {
        const header = global.shallow(<Header />);
        expect(header).toMatchSnapshot();

        const logo = header.find('a.logo');
        expect(header).toMatchSnapshot();
        expect(logo).toHaveLength(1);
    });
});
