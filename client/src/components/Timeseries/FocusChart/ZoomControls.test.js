import React from 'react';
import renderer from 'react-test-renderer';
import { ZoomControls } from './ZoomControls';

describe('Testing focus chart zoom controls on click ->', () => {
  const zoomProps = {
    isEditingEventRange: false,
    isZoomEnabled: false,
    zoomToggle: jest.fn().mockReturnValue({ isZoomEnabled: true }),
    zoom: jest.fn(),
  };

  it('Should render without crashing', () => {
    const zoomWrapper = renderer.create(<ZoomControls {...zoomProps} />).toJSON();
    expect(zoomWrapper).toMatchSnapshot();
  });

  it('Should toggle zoom', () => {
    const zoomWrapper = mount(<ZoomControls {...zoomProps} />);

    zoomWrapper.find('#zoomMode').simulate('change', { target: { checked: true } });
    expect(zoomWrapper.props().zoomToggle).toBeCalled();

    zoomWrapper.setProps({
      isZoomEnabled: true,
    });

    expect(zoomWrapper.find('#zoomMode').instance().checked).toBe(true);
  });

  it('Should handle zoom direction', () => {
    const zoomWrapper = mount(<ZoomControls {...zoomProps} />);
    zoomWrapper.find('#zoomIn').simulate('click');
    expect(zoomWrapper.props().zoom).toBeCalledWith('In');

    zoomWrapper.find('#zoomOut').simulate('click');
    expect(zoomWrapper.props().zoom).toBeCalledWith('Out');
  });
});
