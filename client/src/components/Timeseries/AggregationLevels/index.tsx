import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody } from 'react-bootstrap';
import { RootState } from 'src/model/types';
import { toggleAggregationModal, setAggregationLevelAction } from '../../../model/actions/aggregationLevels';
import { getIsAggregationModalOpen, getAggregationTimeLevel } from '../../../model/selectors/aggregationLevels';
import AggregationChart from './AggregationChart';
import { timeIntervals } from './AggregationChart/Utils';
import './AggregationLevels.scss';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

class AggregationLevels extends Component<Props, {}> {
  renderLevelIntervals() {
    const { setAggregationLevel, currentAggregationLevel } = this.props;

    return (
      <div className="aggregation-wrapper">
        <div className="headings">
          <h4>Aggregation levels:</h4>
          <span className="note">
            <strong>Note:</strong> Fine aggregation levels will require more time to load.
          </span>
        </div>
        <ul className="aggregation-controls">
          {timeIntervals.map((level) => (
            <li key={level}>
              <button
                type="button"
                onClick={() => setAggregationLevel(level)}
                className={currentAggregationLevel.selectedLevel === level ? 'active' : ''}
              >
                {level}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const { isModalOpen, toggleModalState } = this.props;
    return (
      <Modal show={isModalOpen} centered className="aggregation-levels-modal" onHide={() => toggleModalState(false)}>
        <Modal.Header closeButton>Signal Aggregation Levels</Modal.Header>
        <ModalBody>
          {this.renderLevelIntervals()}
          <AggregationChart />
        </ModalBody>
      </Modal>
    );
  }
}

const mapState = (state: RootState) => ({
  isModalOpen: getIsAggregationModalOpen(state),
  currentAggregationLevel: getAggregationTimeLevel(state),
});

const mapDispatch = (dispatch: Function) => ({
  toggleModalState: (modalState) => dispatch(toggleAggregationModal(modalState)),
  setAggregationLevel: (periodLevel) => dispatch(setAggregationLevelAction(periodLevel)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(AggregationLevels);
