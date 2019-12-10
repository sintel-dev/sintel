import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './Overview.scss';

import { fetchExperiment } from '../../../model/actions/experiment';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';

const renderDatarun = (datarun, key) => (
  <div key={key}>
    <p>{datarun.signal}</p>
  </div>
      );
function Experiment({ experimentData }) {
    return (
      <div className="overview-wrapper">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          {
            !experimentData.isExperimentDataLoading ?
             experimentData.data.dataruns.map((datarun, key) => renderDatarun(datarun, key)) :
             <p>soon</p>
        }
        </Loader>
      </div>
    );
}

Experiment.propTypes = {
    experimentData: PropTypes.object,
};

export default connect(state => ({
    experimentData: getSelectedExperimentData(state),
}), dispatch => ({
    fetchExperimentData: () => dispatch(fetchExperiment()),
}))(Experiment);
