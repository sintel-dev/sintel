import React from 'react';
import { connect } from 'react-redux';

import { RootState, DatarunDataType } from '../../../model/types';
import { selectDatarun, setTimeseriesPeriod } from '../../../model/actions/datarun';
import { getSelectedDatarunID, getSelectedPeriodRange, getIsEditingEventRange } from '../../../model/selectors/datarun';
import DrawChart from './DrawChart';

type OwnProps = {
  datarun: DatarunDataType;
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
export type Props = StateProps & DispatchProps & OwnProps;

const Datarun: React.FC<Props> = ({
  datarun,
  onSelectDatarun,
  selectedDatarunID,
  onChangePeriod,
  selectedPeriodRange,
  isEditingEventRange,
}) => {
  const activeClass = datarun.id === selectedDatarunID ? 'active' : '';
  return (
    <div className={`time-row ${activeClass}`} onClick={() => !isEditingEventRange && onSelectDatarun(datarun.id)}>
      <ul>
        <li>{datarun.signal}</li>
        <li>
          <DrawChart
            dataRun={datarun}
            onPeriodTimeChange={onChangePeriod}
            selectedPeriod={selectedPeriodRange}
            selectedDatarunID={selectedDatarunID}
            onSelectDatarun={onSelectDatarun}
          />
        </li>
      </ul>
    </div>
  );
};

const mapState = (state: RootState, ownProps: OwnProps) => ({
  selectedDatarunID: getSelectedDatarunID(state),
  selectedPeriodRange: getSelectedPeriodRange(state),
  isEditingEventRange: getIsEditingEventRange(state),
});

const mapDispatch = (dispatch: Function, ownProps: OwnProps) => ({
  onSelectDatarun: (datarunID: string) => dispatch(selectDatarun(datarunID)),
  onChangePeriod: (period: { eventRange: any; zoomValue: any }) => dispatch(setTimeseriesPeriod(period)),
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapState,
  mapDispatch,
)(Datarun);
