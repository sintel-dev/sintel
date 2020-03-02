import React from 'react';
import './Loader.scss';

type Props = {
  isLoading: boolean;
};

const Loader: React.FC<Props> = ({ isLoading, children }) => {
  const loadingOverlay = () => (
    <div className="loading">
      <div className="loader-overlay">
        <i className="fa fa-sync fa-spin" />
      </div>
    </div>
  );

  return isLoading ? loadingOverlay() : (children as JSX.Element);
};

export default Loader;
