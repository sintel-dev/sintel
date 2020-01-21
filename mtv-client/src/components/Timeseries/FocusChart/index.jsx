import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getDatarunDetails } from '../../../model/selectors/datarun';
import { drawChart } from './FocusChartUtils';
import './FocusChart.scss';

const getWrapperSize = () => {
    const offset = 40;
    const wrapperHeight = document.querySelector('#content-wrapper').clientHeight - offset;
    const overViewHeight = document.querySelector('#overview-wrapper').clientHeight - offset;
    const height = wrapperHeight - overViewHeight - offset;
    const width = document.querySelector('#overview-wrapper').clientWidth - offset / 4;

    return { width, height };
  };

const DrawFocusChart = ({ datarun }) => {
    useEffect(() => {
        const { width, height } = getWrapperSize();
        drawChart(width, height, datarun);
    }, [datarun]);

    return <div id="focusChart" className="focus-chart" />;
};

DrawFocusChart.propTypes = {
    datarun: PropTypes.object,
};

export default connect(state => ({
    datarun: getDatarunDetails(state),
}))(DrawFocusChart);
