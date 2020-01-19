import React from 'react';
import './header.scss';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getSelectedExperiment } from '../../model/selectors/projects';

export interface HeaderProps {
  isExperimentSelected?: null | string
}

const Header: React.FC<HeaderProps> = (props) => {
  const isSwitchActive = props.isExperimentSelected ? 'active' : '';
  return (
    <header id="header" className="main-header">
      <a href="/" className="logo"><b>MTV</b></a>
      <a href="/" className={`page-switch-btn ${isSwitchActive}`}>
        <i className="fas fa-angle-left"></i>
      </a>
    </header>);
};

Header.propTypes = {
  isExperimentSelected: PropTypes.string,
};

export default connect(state => ({
  isExperimentSelected: getSelectedExperiment(state),
}), null)(Header);
