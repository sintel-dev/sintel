import React from 'react';
export const timeIntervals = [
  '30 hours',
  '24 hours',
  '12 hours',
  '6 hours',

  // need timesedies granulation under 6 hours, for now isn't working
  '3 hours',
  '1 hour',
  '30 mins',
  '10 mins',
  '1 mins',
];

export const getAggregationChartCoords = () => {
  const ref = document.querySelector('.aggregation-levels-modal .modal-body');
  const width = ref.clientWidth;
  return { width };
};

export const timestampToDate = (timeStamp) => {
  const date = new Date(timeStamp).toUTCString().split(' ');
  return (
    <div className="date-wrapper">
      <span className="date">
        {date[1]}/{date[2]}/{date[3]}
      </span>
      <span className="time">{date[4]}</span>
    </div>
  );
  // @TODO - investigate if the clean string is needed anymore
  // return `<span>${date[1]}/${date[2]}/${date[3]}</span> <span>${date[4]}</span>`;
};

export const timeToMiliseconds = (interval) => {
  const timeParts = interval.split(' ');
  const time = timeParts[0];
  const period = timeParts[1];

  if (period === 'mins') {
    return time * 60000;
  }

  return time * (60000 * 60);
};
