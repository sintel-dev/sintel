import React from 'react';
import './header.scss';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getSelectedExperiment } from '../../model/selectors/projects';

export interface HeaderProps {
  isExperimentSelected?: any
}

const Header: React.FC<HeaderProps> = (props) => {
  const isSwitchActive = props.isExperimentSelected ? 'active left' : '';
  return (
    <header id="header" className="main-header">
      <a href="/" className="logo"><b>MTV</b></a>
      <a href="/" className={`page-switch-btn ${isSwitchActive}`}>Switch</a>
      <i className="fa fa-caret-right">Switch test</i>
    </header>);
};

Header.propTypes = {
  isExperimentSelected: PropTypes.string,
};

export default connect(state => ({
  isExperimentSelected: getSelectedExperiment(state),
}), null)(Header);
