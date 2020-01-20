import React from 'react';
import { connect } from 'react-redux';
import DrawFocusChart from './DrawFocusChart';

import { getSelectedDatarunID } from '../../../model/selectors/datarun';

const FocusChart = (props) => <DrawFocusChart />;

export default connect(state => ({
    selectedDatarunID: getSelectedDatarunID(state),
}), dispatch => ({

}))(FocusChart);

// export default FocusChart;
