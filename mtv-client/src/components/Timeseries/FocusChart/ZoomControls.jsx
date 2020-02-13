import React from 'react';
import { connect } from 'react-redux';

import { zoomOnClick } from '../../../model/actions/datarun';

const ZoomControls = props => (
  <div>
    <ul>
      <li>
        <label htmlFor="zoomMode">
          <i className="fas fa-arrows-alt" />
          <input type="checkbox" name="zoomMode" />
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

export default connect(null, dispatch => ({
  zoom: direction => dispatch(zoomOnClick(direction)),
}))(ZoomControls);
