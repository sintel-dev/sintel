import React from 'react';
import './Loader.scss';
const Loader = (props) => {

  const { isLoading} = props;

  const loadingOverlay = () => {
    return (
      <div className="loading">
        <div className="loader-overlay">
          <i className="fa fa-refresh fa-spin"></i>
        </div>
      </div>
    )
  }

  return isLoading ? loadingOverlay() : props.children;
};

export default Loader;
