import React from 'react';
import { EventDetails } from './index';
import { renderWithStore, TestWrapper } from '../../../../tests/utils';

jest.mock('./eventUtils', () => ({
  RenderComments: () => 'Render Comments component',
  selectedOption: () => 'Selected Option component',
}));
describe('Testing event Details component ->', () => {
  it('Should render event details without crashing', () => {
    const eventDetailsProps = {
      eventDetails: {
        id: '5da802e1abc5668935743a07',
        tag: null,
        start_time: 1350777600000,
        stop_time: 1354017600000,
        datarun: '5da80105abc56689357439e6',
        signal: 'S-1',
        isCommentsLoading: true,
        score: 0.17587530027941106,
        eventComments: {
          comments: [],
        },
      },
      updatedEventDetails: {
        comments: [],
      },
    };

    const mountedEventDetails = renderWithStore(
      {},
      <TestWrapper>
        <EventDetails {...eventDetailsProps} />
      </TestWrapper>,
    );

    expect(mountedEventDetails).toMatchSnapshot();
  });
});
