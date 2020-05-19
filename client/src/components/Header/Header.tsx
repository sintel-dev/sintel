import React, { useState } from 'react';
import './header.scss';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { getCurrentExperimentDetails } from 'src/model/selectors/experiment';
import { getSelectedExperiment } from '../../model/selectors/projects';
import { onUserLogoutAction } from '../../model/actions/users';
import { RootState } from '../../model/types';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

export const Header: React.FC<Props> = (props) => {
  const isSwitchVisible = props.selectedExperimentID ? 'active' : '';
  const { experimentDetails } = props;
  let location = useLocation();

  const currentView = location.pathname;
  const linkTo = currentView === '/' ? `/experiment/${props.selectedExperimentID}` : '/';

  const logoutUser = () => {
    props.userLogout();
    window.location.href = '/';
  };

  const [isInfoOpen, toggleInfo] = useState(false);
  const activeClass = isInfoOpen ? 'active' : '';

  window.addEventListener('click', (evt: any) => {
    if (currentView === '/') {
      return null;
    }
    const dropdown = document.querySelector('.exp-info');
    dropdown && !dropdown.contains(evt.target) && toggleInfo(false);
  });

  return (
    <header id="header" className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <b>MTV</b>
        </Link>
        <Link to={linkTo} className={`page-switch-btn ${isSwitchVisible}`}>
          <FontAwesomeIcon icon={currentView === '/' ? faChevronRight : faChevronLeft} />
        </Link>
        {currentView !== '/' && (
          <div className="exp-info" onClick={() => toggleInfo(!isInfoOpen)}>
            <ul>
              <li className={activeClass}>
                Details
                <span>
                  <FontAwesomeIcon icon={faCaretDown} />
                </span>
                <ul>
                  <li>
                    <span>Pipeline:</span>
                    <span>{experimentDetails.pipeline}</span>
                  </li>
                  <li>
                    <span>Dataset:</span>
                    <span>{experimentDetails.dataset}</span>
                  </li>
                  <li>
                    <span>By:</span>
                    <span>{experimentDetails.created_by || 'Unknown'}</span>
                  </li>
                  <li>
                    <span>Project:</span>
                    <span>{experimentDetails.project}</span>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        )}

        <ul className="user-opts">
          <li>
            <button type="button" onClick={logoutUser} className="logout-button">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

const mapState = (state: RootState) => ({
  selectedExperimentID: getSelectedExperiment(state),
  experimentDetails: getCurrentExperimentDetails(state),
});

const mapDispatch = (dispatch: Function) => ({
  userLogout: () => dispatch(onUserLogoutAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Header);
