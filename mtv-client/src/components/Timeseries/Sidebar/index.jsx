import React from 'react';
import { connect } from 'react-redux';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Header from './Header';
import './Sidebar.scss';
import { getDatarunDetails } from '../../../model/selectors/datarun';

const Sidebar = ({ experimentData, datarunDetails }) => (
  <div className="sidebar">
    {console.log(datarunDetails)}
    <Loader isLoading={experimentData.isExperimentDataLoading}>
      <Header headerTitle={datarunDetails.signal} />
    </Loader>
  </div>
);

export default connect(state => ({
  experimentData: getSelectedExperimentData(state),
  datarunDetails: getDatarunDetails(state),
}))(Sidebar);
