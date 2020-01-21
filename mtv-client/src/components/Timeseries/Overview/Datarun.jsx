import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectDatarun, setTimeseriesPeriod } from '../../../model/actions/datarun';
import { getSelectedDatarunID, getSelectedTimePeriod } from '../../../model/selectors/datarun';
import DrawChart from './DrawChart';

const Datarun = ({ datarun, onSelectDatarun, selectedDatarunID, onChangePeriod, selectedTimePeriod }) => {
  const activeClass = datarun.id === selectedDatarunID ? 'active' : '';

  return (
    <div className={`time-row ${activeClass}`} onClick={() => onSelectDatarun(datarun.id)}>
      <ul>
        <li>{datarun.signal}</li>
        <li>
          <DrawChart dataRun={datarun} onPeriodTimeChange={onChangePeriod} selectedPeriod={selectedTimePeriod} />
        </li>
      </ul>
    </div>
  );
};

Datarun.propTypes = {
  datarun: PropTypes.object,
  onSelectDatarun: PropTypes.func,
  selectedDatarunID: PropTypes.string,
  onChangePeriod: PropTypes.func,
  selectedTimePeriod: PropTypes.array,
};

export default connect(
  state => ({
    selectedDatarunID: getSelectedDatarunID(state),
    selectedTimePeriod: getSelectedTimePeriod(state),
  }),
  dispatch => ({
    onSelectDatarun: datarunID => dispatch(selectDatarun(datarunID)),
    onChangePeriod: period => dispatch(setTimeseriesPeriod(period)),
  }),
)(Datarun);
