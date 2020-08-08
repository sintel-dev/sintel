import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as fileDownload from 'react-file-download';
import { faChevronRight, faChevronLeft, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { getCurrentExperimentDetails, getSelectedExperimentData } from 'src/model/selectors/experiment';
import { filterEventsByTagAction, toggleTimeSyncModeAction } from 'src/model/actions/datarun';
import { getIsTimeSyncModeEnabled, getDatarunDetails } from 'src/model/selectors/datarun';
import { getSelectedExperiment } from '../../model/selectors/projects';
import { onUserLogoutAction } from '../../model/actions/users';
import { RootState } from '../../model/types';
import { VerticalDots, DownloadIcon, UploadIcon, LineIcon, StepIcon } from '../Common/icons';
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

export const Header: React.FC<Props> = (props) => {
  const isSwitchVisible = props.selectedExperimentID ? 'active' : '';
  const { experimentDetails, isTimeSyncEnabled, filterByTags, toggleTimeSync, datarunDetails, experimentData } = props;
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
                      <button type="button">
                        <LineIcon />
                        Line
                      </button>
                      <button type="button">
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
              <button type="button" onClick={logoutUser} className="logout-button">
                Logout
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
});

const mapDispatch = (dispatch: Function) => ({
  userLogout: () => dispatch(onUserLogoutAction()),
  filterByTags: (tags) => dispatch(filterEventsByTagAction(tags)),
  toggleTimeSync: (mode) => dispatch(toggleTimeSyncModeAction(mode)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Header);
