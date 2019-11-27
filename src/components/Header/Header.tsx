import React from 'react';
import './header.scss';


const Header: React.FC = () => {
    return (
        <header id="header" className="main-header">
            <a href="/" className="logo"><b>MTV</b></a>
            <a href="/" className="page-switch-btn" data-bind="click: pageSwitch" />
        </header>
    );
}

export default Header;
