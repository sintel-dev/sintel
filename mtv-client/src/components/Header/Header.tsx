import React from 'react';
import './header.scss';
import { connect } from 'react-redux';
import { getSelectedExperiment } from '../../model/selectors/projects';
import { RootState } from '../../model/types';

const mapState = (state: RootState) => ({
  isExperimentSelected: getSelectedExperiment(state),
});

type StateProps = ReturnType<typeof mapState>;
type Props = StateProps;

const Header: React.FC<Props> = props => {
  const isSwitchActive = props.isExperimentSelected ? 'active' : '';
  return (
    <header id="header" className="main-header">
      <a href="/" className="logo">
        <b>MTV</b>
      </a>
      <a href="/" className={`page-switch-btn ${isSwitchActive}`}>
        <i className="fas fa-angle-left" />
      </a>
    </header>
  );
};

export default connect<StateProps, {}, {}, RootState>(mapState)(Header);
