import React from 'react';
import './header.scss';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { getSelectedExperiment } from '../../model/selectors/projects';
import { onUserLogoutAction } from '../../model/actions/users';
import { RootState } from '../../model/types';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

export const Header: React.FC<Props> = (props) => {
  const isSwitchVisible = props.selectedExperimentID ? 'active' : '';
  let history = useHistory();
  const currentView = history.location.pathname;
  const linkTo = currentView === '/' ? `/experiment/${props.selectedExperimentID}` : '/';
  const logoutUser = () => {
    props.userLogout();
    window.location.href = '/';
  };
  return (
    <header id="header" className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <b>MTV</b>
        </Link>
        <Link to={linkTo} className={`page-switch-btn ${isSwitchVisible}`}>
          <FontAwesomeIcon icon={currentView === '/' ? faChevronRight : faChevronLeft} />
        </Link>
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
});

const mapDispatch = (dispatch: Function) => ({
  userLogout: () => dispatch(onUserLogoutAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Header);
