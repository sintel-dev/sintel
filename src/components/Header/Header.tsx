import React from 'react';
import './header.scss';

const Header: React.FC = () => (
  <header id="header" className="main-header">
    <a href="/" className="logo"><b>MTV</b></a>
    <a href="/" className="page-switch-btn">Switch</a>
  </header>
    );

export default Header;
