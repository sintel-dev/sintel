import React from 'react';
import { connect } from 'react-redux';
import { getZoomMode } from '../../../model/selectors/datarun';
import { zoomOnClick, zoomToggleAction } from '../../../model/actions/datarun';

const ZoomControls = props => (
  <div>
    <ul>
      <li>
        <label htmlFor="zoomMode">
          <i className="fas fa-arrows-alt" />
          <input
            type="checkbox"
            name="zoomMode"
            id="zoomMode"
            checked={props.isZoomEnabled}
            onChange={event => props.zoomToggle(event.target.checked)}
          />
        </label>
      </li>
      <li>
        <button type="button" onClick={() => props.zoom('In')}>
          <span>+</span>
        </button>
      </li>
      <li>
        <button type="button" onClick={() => props.zoom('Out')}>
          <span>-</span>
        </button>
      </li>
    </ul>
  </div>
);

export default connect(
  state => ({
    isZoomEnabled: getZoomMode(state),
  }),
  dispatch => ({
    zoom: direction => dispatch(zoomOnClick(direction)),
    zoomToggle: mode => dispatch(zoomToggleAction(mode)),
  }),
)(ZoomControls);
