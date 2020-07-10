import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as fileDownload from 'react-file-download';
import UploadEvents from '../UploadEvents';
import { togglePredictionsAction, addNewEventAction, filterEventsByTagAction } from '../../../model/actions/datarun';
import { isPredictionEnabled, getIsAddingNewEvents, getDatarunDetails } from '../../../model/selectors/datarun';
import { UploadIcon, DownloadIcon } from '../../Common/icons';
import Dropdown from '../../Common/Dropdown';
import './FocusChartControls.scss';

const downloadAsJSON = (datarunDetails) => {
  const { events } = datarunDetails;
  const jsonData = JSON.stringify(events);
  fileDownload(jsonData, `Datarun_${datarunDetails.id}.json`);
};

class FocusChartControls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploadModalVisible: false,
    };
  }

  toggleModalState(modalState) {
    this.setState({
      isUploadModalVisible: modalState,
    });
  }

  render() {
    const {
      isAddingEvent,
      togglePredictions,
      filterByTags,
      addNewEvent,
      isEnabledPrediction,
      datarunDetails,
    } = this.props;

    const dropDownProps = {
      isMulti: true,
      closeMenuOnSelect: false,
      placeholder: 'All tags',
      onChange: filterByTags,
    };

    return (
      <div className="chart-controls" id="chartControls">
        <div className="linechart-controls switch-control">
          <div className="row">
            <button
              type="button"
              className="btn btn-add-event"
              disabled={isAddingEvent}
              onClick={() => addNewEvent(!isAddingEvent)}
            >
              <span>+</span>
              Add Event
            </button>
          </div>
          <div className="row">
            <label htmlFor="showPredictions">
              <input
                type="checkbox"
                id="showPredictions"
                checked={isEnabledPrediction}
                onChange={(event) => togglePredictions(event.target.checked)}
              />
              <span className="switch" />
              Show Predictions
            </label>
          </div>
        </div>
        <div className="tag-wrapper">
          <Dropdown {...dropDownProps} />
        </div>
        <div className="download-wrapper">
          <button type="button" onClick={() => this.setState({ isUploadModalVisible: true })}>
            <UploadIcon />
          </button>
          <button type="button" onClick={() => downloadAsJSON(datarunDetails)}>
            <DownloadIcon />
          </button>
        </div>
        <UploadEvents
          isUploadModalVisible={this.state.isUploadModalVisible}
          toggleModalState={(modalState) => this.toggleModalState(modalState)}
        />
      </div>
    );
  }
}

FocusChartControls.propTypes = {
  togglePredictions: PropTypes.func,
  isEnabledPrediction: PropTypes.bool,
};

export default connect(
  (state) => ({
    isEnabledPrediction: isPredictionEnabled(state),
    isAddingEvent: getIsAddingNewEvents(state),
    datarunDetails: getDatarunDetails(state),
  }),
  (dispatch) => ({
    togglePredictions: (event) => dispatch(togglePredictionsAction(event)),
    addNewEvent: (isAddingEvent) => dispatch(addNewEventAction(isAddingEvent)),
    filterByTags: (tags) => dispatch(filterEventsByTagAction(tags)),
  }),
)(FocusChartControls);
