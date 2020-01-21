import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getDatarunDetails } from '../../../model/selectors/datarun';
import { drawChart } from './FocusChartUtils';
import './FocusChart.scss';

class DrawFocusChart extends Component {
  constructor(...props) {
    super(...props);
    this.width = 0;
    this.height = 0;
  }

  componentDidMount() {
    const { width, height } = this.getWrapperSize();
    const { datarun } = this.props;
    this.width = width;
    this.height = height;
    drawChart(width, height, datarun);
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
      if (nextProps.datarun.id !== this.props.datarun.id) {
        drawChart(this.width, this.height, nextProps.datarun, 'update');
      }
  }

  getWrapperSize() {
    const offset = 40;
    const wrapperHeight = document.querySelector('#content-wrapper').clientHeight - offset;
    const overViewHeight = document.querySelector('#overview-wrapper').clientHeight - offset;
    const height = wrapperHeight - overViewHeight - offset;
    const width = document.querySelector('#overview-wrapper').clientWidth - offset / 4;

    return { width, height };
  }

  render() {
    return <div id="focusChart" className="focus-chart" />;
  }
}

DrawFocusChart.propTypes = {
    datarun: PropTypes.object,
};

export default connect(state => ({
    datarun: getDatarunDetails(state),
}), null)(DrawFocusChart);
