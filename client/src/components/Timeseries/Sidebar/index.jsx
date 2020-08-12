import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getIsSimilarShapesModalOpen } from 'src/model/selectors/similarShapes';
import { ArrowDown, ArrowUp } from 'src/components/Common/icons';
import { Collapse } from 'react-collapse';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import { getIsEditingEventRange } from '../../../model/selectors/datarun';
import PeriodicalView from './SidebarComponents/PeriodicalView/PeriodicalView';
import EventDetailsView from './SidebarComponents/EventDetailsView/EventDetailsView';
import SignalAnnotations from './SidebarComponents/SignalAnnotationsView/SignalAnnotations';
import SimilarShapes from './SidebarComponents/SimilarShapes';
import './Sidebar.scss';

class Sidebar extends Component {
  constructor(...props) {
    super(...props);
    this.state = {
      sections: [
        {
          key: 'periodicalView',
          isOpen: false,
          title: 'Periodical View',
          component: <PeriodicalView />,
        },
        {
          key: 'signalView',
          isOpen: true,
          title: 'Signal Annotations',
          component: <SignalAnnotations />,
        },
        {
          key: 'eventView',
          isOpen: false,
          title: 'Event Details',
          component: <EventDetailsView />,
        },
      ],
    };
  }

  togglePanel(sectionName, state) {
    const { sections } = this.state;
    const sectionIndex = this.state.sections.findIndex((section) => section.key === sectionName);
    const changedSection = { ...sections[sectionIndex], isOpen: state };
    let changedSections = sections;

    changedSections.map((currentSection) => {
      currentSection.isOpen = false;
    });

    changedSections[sectionIndex] = changedSection;

    this.setState({
      sections: changedSections,
    });
  }

  render() {
    const { experimentData, isSimilarShapesOpen } = this.props;
    const { sections } = this.state;
    return (
      <div className="right-sidebar">
        {isSimilarShapesOpen && <SimilarShapes />}
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          {sections.map((currentSection) => {
            const { isOpen, title } = currentSection;
            return (
              <div key={currentSection.key} className={`collapsible-wrapper ${isOpen ? 'active' : ''}`}>
                <div className="collapsible-trigger" onClick={() => this.togglePanel(currentSection.key, !isOpen)}>
                  <ul>
                    <li>{title}</li>
                    <li>{isOpen ? <ArrowUp /> : <ArrowDown />}</li>
                  </ul>
                </div>
                <div className="collapsible-content">
                  <Collapse isOpened={isOpen}>{currentSection.component}</Collapse>
                </div>
              </div>
            );
          })}
        </Loader>
      </div>
    );
  }
}

export default connect((state) => ({
  experimentData: getSelectedExperimentData(state),
  isEditingEventRange: getIsEditingEventRange(state),
  isSimilarShapesOpen: getIsSimilarShapesModalOpen(state),
}))(Sidebar);
