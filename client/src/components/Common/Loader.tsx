import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import './Loader.scss';

type Props = {
  isLoading: boolean;
};

const Loader: React.FC<Props> = ({ isLoading, children }) => {
  const loadingOverlay = () => (
    <div className="loading">
      <div className="loader-overlay">
        <FontAwesomeIcon className="fa-spin" icon={faSync} />
      </div>
    </div>
  );

  return isLoading ? loadingOverlay() : (children as JSX.Element);
};

export default Loader;
