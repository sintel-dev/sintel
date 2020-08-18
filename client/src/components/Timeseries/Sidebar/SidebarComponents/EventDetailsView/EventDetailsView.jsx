import React, { Component } from 'react';
import { connect } from 'react-redux';

import './EventDetails.scss';
class EventDetailsView extends Component {
  render() {
    return (
      <div className="event-details">
        <p>Event Details Here</p>
      </div>
    );
  }
}

export default connect((state) => ({}))(EventDetailsView);
