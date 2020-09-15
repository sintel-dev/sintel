import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as fileDownload from 'react-file-download';
import { faChevronRight, faChevronLeft, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { getCurrentExperimentDetails, getSelectedExperimentData } from 'src/model/selectors/experiment';
import { filterEventsByTagAction, toggleTimeSyncModeAction, switchChartStyleAction } from 'src/model/actions/datarun';
import { getIsTimeSyncModeEnabled, getDatarunDetails, getCurrentChartStyle } from 'src/model/selectors/datarun';
import { AUTH_USER_DATA } from 'src/model/utils/constants';
import { getSelectedExperiment } from '../../model/selectors/projects';
import { onUserLogoutAction } from '../../model/actions/users';
import { RootState } from '../../model/types';
import { VerticalDots, DownloadIcon, UploadIcon, LineIcon, StepIcon, LogoutIcon } from '../Common/icons';
import Dropdown from '../Common/Dropdown';
import UploadEvents from '../Timeseries/UploadEvents';
import './header.scss';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

const downloadAsJSON = (dataRun) => {
  const { events, id } = dataRun;
  const jsonData = JSON.stringify(events);
  fileDownload(jsonData, `Datarun_${id}.json`);
};

const filterOptions = [
  { value: 'Investigate', label: 'Investigate', icon: 'investigate', isFixed: true },
  { value: 'Do not Investigate', label: 'Do not Investigate', icon: 'not_investigate', isFixed: true },
  { value: 'Postpone', label: 'Postpone', icon: 'postpone', isFixed: true },
  { value: 'Problem', label: 'Problem', icon: 'problem', isFixed: true },
  { value: 'Previously seen', label: 'Previously seen', icon: 'seen', isFixed: true },
  { value: 'Normal', label: 'Normal', icon: 'normal', isFixed: true },
  { value: 'Untagged', label: 'Untagged', icon: 'untagged', isFixed: true },
];

const formatOptionLabel = ({ label, icon }) => (
  <div className="select-row">
    <i className={`select ${icon}`} />
    <span>{label}</span>
  </div>
);

export const Header: React.FC<Props> = (props) => {
  const isSwitchVisible = props.selectedExperimentID ? 'active' : '';
  const {
    experimentDetails,
    isTimeSyncEnabled,
    filterByTags,
    toggleTimeSync,
    datarunDetails,
    experimentData,
    switchChartStyle,
    currentChartStyle,
  } = props;
  const { isExperimentDataLoading } = experimentData;

  let location = useLocation();

  const currentView = location.pathname;
  const linkTo = currentView === '/' ? `/experiment/${props.selectedExperimentID}` : '/';

  const logoutUser = () => {
    props.userLogout();
    window.location.href = '/';
  };

  const [isInfoOpen, toggleInfo] = useState(false);
  const [isOptsOpen, toggleOptsState] = useState(false);
  const [isUploadModalVisible, toggleUploadModalState] = useState(false);
  const activeClass = isInfoOpen ? 'active' : '';

  const dropDownProps = {
    isMulti: true,
    closeMenuOnSelect: false,
    placeholder: 'Filter',
    onChange: filterByTags,
    formatOptionLabel,
    options: filterOptions,
  };

  window.addEventListener('click', (evt: Event) => {
    if (currentView === '/') {
      return null;
    }
    const dropdown = document.querySelector('.exp-info');
    dropdown && !dropdown.contains(evt.target as Node) && toggleInfo(false);

    const userOpts = document.querySelector('.data-opts');
    userOpts && !userOpts.contains(evt.target as Node) && toggleOptsState(false);
    return null;
  });

  // @TODO - check the case of normal/non google login
  const userData = JSON.parse(Cookies.get(AUTH_USER_DATA));

  const { name, picture } = userData;
  const isLinearBtnActive = currentChartStyle === 'linear' ? 'active' : '';
  const isStepBtnActive = currentChartStyle !== 'linear' ? 'active' : '';
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
          <div className="header-left-wrapper">
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
            <ul className={`data-opts ${isOptsOpen ? 'active' : ''}`}>
              <li>
                <button
                  type="button"
                  className="toggle-data-ops"
                  onClick={() => toggleOptsState(!isOptsOpen)}
                  disabled={isExperimentDataLoading}
                >
                  <VerticalDots />
                </button>
                <ul>
                  <li onClick={() => toggleUploadModalState(true)}>
                    <UploadIcon />
                    Import .JSON File
                  </li>
                  <li onClick={() => downloadAsJSON(datarunDetails)}>
                    <DownloadIcon />
                    Save Events as .JSON File
                  </li>
                  <li className="view-options">
                    <span>Chart Style</span>
                    <div className="switch-control-wrapper">
                      <button type="button" className={isLinearBtnActive} onClick={() => switchChartStyle('linear')}>
                        <LineIcon />
                        Line
                      </button>
                      <button type="button" className={isStepBtnActive} onClick={() => switchChartStyle('step')}>
                        <StepIcon />
                        Step
                      </button>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
            <div className="tag-wrapper">
              <Dropdown {...dropDownProps} />
            </div>
          </div>
        )}

        <div className="header-right-wrapper">
          {currentView !== '/' && (
            <div className="switch-control reversed">
              <div className="row">
                <label htmlFor="toggleTimeSync">
                  Sync Time Ranges
                  <input
                    type="checkbox"
                    id="toggleTimeSync"
                    onChange={(event) => toggleTimeSync(event.target.checked)}
                    checked={isTimeSyncEnabled}
                  />
                  <span className="switch" />
                </label>
              </div>
            </div>
          )}
          <ul className="user-opts">
            <li>
              <img src={picture} referrerPolicy="no-referrer" alt={name} />
            </li>
            <li>{name}</li>
            <li>
              <button type="button" onClick={logoutUser} className="logout-button">
                <LogoutIcon />
              </button>
            </li>
          </ul>
          <div className="clear" />
        </div>
      </div>
      <UploadEvents
        isUploadModalVisible={isUploadModalVisible}
        toggleModalState={(modalState) => toggleUploadModalState(modalState)}
      />
    </header>
  );
};

const mapState = (state: RootState) => ({
  selectedExperimentID: getSelectedExperiment(state),
  experimentDetails: getCurrentExperimentDetails(state),
  isTimeSyncEnabled: getIsTimeSyncModeEnabled(state),
  datarunDetails: getDatarunDetails(state),
  experimentData: getSelectedExperimentData(state),
  currentChartStyle: getCurrentChartStyle(state),
});

const mapDispatch = (dispatch: Function) => ({
  userLogout: () => dispatch(onUserLogoutAction()),
  filterByTags: (tags) => dispatch(filterEventsByTagAction(tags)),
  toggleTimeSync: (mode) => dispatch(toggleTimeSyncModeAction(mode)),
  switchChartStyle: (style) => dispatch(switchChartStyleAction(style)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Header);
