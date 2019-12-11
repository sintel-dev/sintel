import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './Overview.scss';

import {
  getSelectedExperimentData,
  getProcessedDataRuns,
} from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Datarun from './Datarun';

function Experiment({ experimentData, processedDataruns }) {
    return (
      <div className="overview-wrapper scroll-style">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          {
            !experimentData.isExperimentDataLoading && experimentData.data.dataruns.length ?
              processedDataruns.map(datarun =>
                <Datarun datarun={datarun} key={datarun.id} />) :
              <p>No datarun for current experiment</p>
          }
        </Loader>
      </div>
    );
}

Experiment.propTypes = {
    experimentData: PropTypes.object,
    processedDataruns: PropTypes.array,
};

export default connect(state => ({
    experimentData: getSelectedExperimentData(state),
    processedDataruns: getProcessedDataRuns(state),
}), null)(Experiment);
