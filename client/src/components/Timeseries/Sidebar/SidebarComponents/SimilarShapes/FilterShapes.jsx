import React, { Component } from 'react';
import { connect } from 'react-redux';
import { similarShapesResults, getPercentageInterval } from 'src/model/selectors/similarShapes';
import { Collapse } from 'react-collapse';
import './FilterShapes.scss';
import { updateCurrentPercentage } from 'src/model/actions/similarShapes';
import { TriangleDown, TriangleUp } from 'src/components/Common/icons';

const percentageCount = () => {
  const stepValues = [];
  for (let iterator = 0; iterator <= 100; iterator += 5) {
    stepValues.push(iterator);
  }

  return stepValues;
};

class FilterShapes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFilteringVisible: true,
    };
  }

  toggleFilter() {
    const { isFilteringVisible } = this.state;
    this.setState({
      isFilteringVisible: !isFilteringVisible,
    });
  }

  renderStepHeight(percentage) {
    const { grouppedShapes } = this.countSimilarity();
    const graphHeight = 40;
    const shapeIndex = grouppedShapes.findIndex((similarity) => similarity[0] === percentage);
    if (shapeIndex === -1) {
      return 0;
    }
    const shapeHeight = (grouppedShapes[shapeIndex][1] * 100) / graphHeight;

    return shapeHeight;
  }

  grouppedIntervals() {
    const steps = percentageCount();
    const intervals = steps.reduce((acc, elem) => {
      if (elem !== 100) {
        const nextStep = elem + 5;
        const newEntry = [elem, nextStep];
        acc.push(newEntry);
      }
      return acc;
    }, []);

    return intervals;
  }

  countSimilarity() {
    const { currentShapes } = this.props;
    const intervals = this.grouppedIntervals();
    const grouppedShapes = intervals.map((currentInterval) => {
      const [min, max] = currentInterval;
      return [
        max,
        currentShapes.filter((shape) => shape.similarity * 100 >= min && shape.similarity * 100 <= max).length,
      ];
    });
    return { grouppedShapes };
  }

  renderSteps(graph = false) {
    const { setPercentageInterval, percentageInterval } = this.props;
    const percentage = percentageCount();
    const [minPercentage, maxPercentage] = percentageInterval;

    return percentage.map((currentPercent) => {
      const activePercent = currentPercent >= minPercentage && currentPercent <= 100 ? 'active' : '';
      const activeColumn = currentPercent > minPercentage && currentPercent <= 100 ? 'active' : '';
      const activeGlissor = currentPercent === minPercentage || currentPercent === maxPercentage ? 'active' : '';

      return graph ? (
        <li
          key={`step_${currentPercent}`}
          className={`step ${activeColumn}`}
          onClick={() => setPercentageInterval(currentPercent)}
        >
          <span className="step-graph" style={{ height: `${this.renderStepHeight(currentPercent)}%` }} />
        </li>
      ) : (
        <li
          key={`value_${currentPercent}`}
          className={activePercent}
          onClick={() => setPercentageInterval(currentPercent)}
        >
          <span className={`glissor ${activeGlissor}`} />
          <span className="step-value">{currentPercent}</span>
        </li>
      );
    });
  }

  render() {
    const { isFilteringVisible } = this.state;
    const { percentageInterval } = this.props;
    const collapseTheme = {
      collapse: 'filter-shapes-collapse',
      content: 'filter-shapes-content',
    };

    const renderArrow = isFilteringVisible ? <TriangleUp /> : <TriangleDown />;

    return (
      <div className="filter-wrapper">
        <div>
          <ul className="info" onClick={() => this.toggleFilter()}>
            <li>Filter Results by Similarity</li>
            <li>
              <span>{percentageInterval[0]} - 100%</span>
              <span>{renderArrow}</span>
            </li>
          </ul>
        </div>

        <div className="filter-collapsible">
          <Collapse isOpened={isFilteringVisible} theme={collapseTheme}>
            <div className="filtering">
              <ul>{this.renderSteps(true)}</ul>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${100 - percentageInterval[0]}%` }} />
              </div>
              <ul>{this.renderSteps(false)}</ul>
            </div>
          </Collapse>
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    currentShapes: similarShapesResults(state),
    percentageInterval: getPercentageInterval(state),
  }),
  (dispatch) => ({
    setPercentageInterval: (value) => dispatch(updateCurrentPercentage(value)),
  }),
)(FilterShapes);
