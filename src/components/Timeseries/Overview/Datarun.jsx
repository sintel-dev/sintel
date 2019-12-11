import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectDatarun } from '../../../model/actions/datarun';
import { getSelectedDatarunID } from '../../../model/selectors/datarun';
import DrawChart from './DrawChart';

const Datarun = ({ datarun, isLoading, onSelectDatarun, selectedDatarunID }) => {
    const activeClass = datarun.id === selectedDatarunID ? 'active' : '';
    return (
      <div className={`time-row ${activeClass}`} onClick={() => onSelectDatarun(datarun.id)}>
        <ul>
          <li>{datarun.signal}</li>
          <li><DrawChart dataRun={datarun} isLoading={isLoading} /></li>
        </ul>
      </div>
  );
};

Datarun.propTypes = {
    datarun: PropTypes.object,
    isLoading: PropTypes.bool,
    onSelectDatarun: PropTypes.func,
    selectedDatarunID: PropTypes.string,
};

export default connect(state => ({
    selectedDatarunID: getSelectedDatarunID(state),
}), dispatch => ({
    onSelectDatarun: (datarunID) => dispatch(selectDatarun(datarunID)),
}))(Datarun);
