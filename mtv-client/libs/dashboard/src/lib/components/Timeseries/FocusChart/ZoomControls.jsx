import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons'
import { getZoomMode, getIsEditingEventRange } from '../../../model/selectors/datarun';
import { zoomOnClick, zoomToggleAction } from '../../../model/actions/datarun';

const ZoomControls = props => (
  <div>
    <ul>
      <li>
        <label htmlFor="zoomMode">
          <FontAwesomeIcon icon={faArrowsAlt} />
          <input
            type="checkbox"
            name="zoomMode"
            id="zoomMode"
            checked={props.isZoomEnabled}
            onChange={event => !props.isEditingEventRange && props.zoomToggle(event.target.checked)}
          />
        </label>
      </li>
      <li>
        <button type="button" onClick={() => props.zoom('In')} disabled={props.isEditingEventRange}>
          <span>+</span>
        </button>
      </li>
      <li>
        <button type="button" onClick={() => props.zoom('Out')} disabled={props.isEditingEventRange}>
          <span>-</span>
        </button>
      </li>
    </ul>
  </div>
);

export default connect(
  state => ({
    isZoomEnabled: getZoomMode(state),
    isEditingEventRange: getIsEditingEventRange(state),
  }),
  dispatch => ({
    zoom: direction => dispatch(zoomOnClick(direction)),
    zoomToggle: mode => dispatch(zoomToggleAction(mode)),
  }),
)(ZoomControls);
