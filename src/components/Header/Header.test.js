import React from 'react';
import Header from './Header';
import ShallowRenderer from 'react-test-renderer/shallow';

describe('Should render header', () => {
    it('Renders header', () => {
        const renderer = new ShallowRenderer();
        renderer.render(<Header />);
        const result = renderer.getRenderOutput();
        const {children} = result.props;
        expect(result.type).toBe('header');
        expect(result.props.className).toBe('main-header');
        expect(children[0].props.className).toBe('logo');
    });
})
