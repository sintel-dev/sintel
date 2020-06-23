import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleSimilarShapesModalAction } from 'src/model/actions/similarShapes';
import { getDatarunDetails, getCurrentEventDetails } from 'src/model/selectors/datarun';
import { RootState } from '../../../../model/types';
import Dropdown from '../../../Common/Dropdown';
import { getIsSimilarShapesModalOpen } from '../../../../model/selectors/similarShapes';
import { CloseIcon } from '../../../Common/icons';
import './SimilarShapes.scss';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type State = {
  width: number;
};

type Props = StateProps & DispatchProps;

class SimilarShapes extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
    };
  }

  componentDidMount() {
    if (!this.props.isModalOpen) {
      return;
    }
    const width = document.querySelector('.shape-chart').clientWidth;
    this.setState({
      width,
    });
  }

  getScale() {
    console.log(this.state);
    // const { width } = this.state;
  }

  onTagSelect(tag) {
    console.log(tag, 'Similar shapes');
  }

  renderShapeDetails() {
    const { eventDetails } = this.props;
    const { width } = this.state;
    debugger;
    return (
      <div className="shape-details">
        <div className="info">
          <ul>
            <li>
              <span>Start:</span>
              <span>5 Sep 2016 23:00:00</span>
            </li>
            <li>
              <span>Ends:</span>
              <span>Sat, 22 Oct 2016 11:00:00</span>
            </li>
            <li>
              <span>Similarity:</span>
              <span>88%</span>
            </li>
            <li>
              <Dropdown onChange={(tag) => this.onTagSelect(tag)} />
            </li>
          </ul>
        </div>
        <div className="drawing">
          <svg width={width} height="110" className="shape-chart">
            {/* {this.drawLine(this.props.periodRange)} */}
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const { isModalOpen, toggleSimilarShapesModal } = this.props;
    const isActive = isModalOpen ? 'active' : '';
    return (
      isModalOpen && (
        <div className={`similar-shapes ${isActive}`}>
          <button type="button" onClick={() => toggleSimilarShapesModal(false)} className="close">
            <CloseIcon />
          </button>
          <h3>Similar Segments Lis</h3>
          <ul className="select-controls">
            <li>Override segments tags:</li>
            <li>
              <Dropdown onChange={(tag) => this.onTagSelect(tag)} />
            </li>
          </ul>
          <div>
            {this.renderShapeDetails()}
            {/* <ShapeDetails /> */}
          </div>
        </div>
      )
    );
  }
}

const mapState = (state: RootState) => ({
  isModalOpen: getIsSimilarShapesModalOpen(state),
  dataRun: getDatarunDetails(state),
  eventDetails: getCurrentEventDetails(state),
});

const mapDispatch = (dispatch: Function) => ({
  toggleSimilarShapesModal: (modalState) => dispatch(toggleSimilarShapesModalAction(modalState)),
});

export default connect<StateProps, DispatchProps, RootState>(mapState, mapDispatch)(SimilarShapes);
