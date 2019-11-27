import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { fetchExperiments } from '../model/actions/api';
import {
    getIsExperimentsLoading,
    getExperiments
} from '../../model/selectors/experiments';

// class Experiments extends Component {
//     componentDidMount() {
//         this.props.fetchExperiments();
//     }

//     renderExperiment() {
//         const { experiments } = this.props;
//         // return 'Running';
//         return experiments.experiments.map(experiment => (
//           <div key={experiment.id}>{experiment.id}</div>
//         ));
//     }

//     render() {
//         const { isExperimentsLoading } = this.props;
//         return (
//             !isExperimentsLoading && this.renderExperiment()
//         );
//     }
// }

const Experiments = ({ dispatch, isExperimentsLoading, experiments }) => {
    useEffect(() => {
        dispatch(fetchExperiments());
    }, [dispatch]);

    return isExperimentsLoading ?
        null :
        (experiments.experiments || []).map(experiment => (
          <div key={experiment.id}>{experiment.id}</div>
        ));
    };

Experiments.propTypes = {
    dispatch: PropTypes.func,
    isExperimentsLoading: PropTypes.bool,
    experiments: PropTypes.object
};
export default connect(state => ({
    isExperimentsLoading: getIsExperimentsLoading(state),
    experiments: getExperiments(state)
}))(Experiments);
