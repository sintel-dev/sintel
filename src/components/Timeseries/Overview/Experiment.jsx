import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { fetchExperiment } from '../../../model/actions/experiment';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';

function Experiment({ experimentData }) {
    console.log(experimentData);
    return (
      <p>Experiment here</p>
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
