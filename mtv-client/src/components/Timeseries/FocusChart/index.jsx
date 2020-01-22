import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FocusChart from './FocusChart';
import { getDatarunDetails } from '../../../model/selectors/datarun';
import './FocusChart.scss';

const getWrapperSize = () => {
    const wrapperOffset = 40;
    const wrapperHeight = document.querySelector('#content-wrapper').clientHeight - wrapperOffset;
    const overViewHeight = document.querySelector('#overview-wrapper').clientHeight - wrapperOffset;
    const height = wrapperHeight - overViewHeight - wrapperOffset;
    const width = document.querySelector('#overview-wrapper').clientWidth - wrapperOffset / 4;

    return { width, height };
};

const DrawChart = ({ datarun }) => {
    useEffect(() => {
        const { width, height } = getWrapperSize();
        const chart = new FocusChart('focusChart', width, height, datarun);
        chart.Draw();
    }, [datarun]);

     return (
       <div className="focus-chart">
         <svg id="focusChart" />
       </div>
    );
};

DrawChart.propTypes = {
    datarun: PropTypes.object,
};

export default connect(state => ({
    datarun: getDatarunDetails(state),
}))(DrawChart);
