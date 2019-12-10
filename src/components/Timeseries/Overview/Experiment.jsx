import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './Overview.scss';

import { getSelectedExperimentData, getProcessedDataRun } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import DrawChart from './DrawChart';


const renderDatarun = (datarun, key, isLoading) => (
  <div key={key} className="time-row">
    <ul>
      <li>{datarun.signal}</li>
      <li><DrawChart dataRun={datarun} isLoading={isLoading} /></li>
    </ul>
  </div>);

function Experiment({ experimentData, processedDatarun }) {
    return (
      <div className="overview-wrapper scroll-style">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          {
            !experimentData.isExperimentDataLoading && experimentData.data.dataruns.length ?
              processedDatarun.map((datarun, key) => renderDatarun(datarun, key, experimentData.isExperimentDataLoading)) :
              <p>No datarun for this experiment</p>
          }
        </Loader>
      </div>
    );
}

Experiment.propTypes = {
    experimentData: PropTypes.object,
    processedDatarun: PropTypes.array,
};

export default connect(state => ({
    experimentData: getSelectedExperimentData(state),
    processedDatarun: getProcessedDataRun(state),
}), null)(Experiment);
