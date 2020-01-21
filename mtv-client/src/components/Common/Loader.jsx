import React from 'react';
import './Loader.scss';

const Loader = props => {
  const { isLoading } = props;

  const loadingOverlay = () => (
    <div className="loading">
      <div className="loader-overlay">
        <i className="fa fa-refresh fa-spin" />
      </div>
    </div>
  );

  return isLoading ? loadingOverlay() : props.children;
};

export default Loader;
