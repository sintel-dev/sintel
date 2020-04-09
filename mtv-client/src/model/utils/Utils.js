export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fromMonthToIndex = (month) => months.indexOf(month) + 1;
export const maxDaysInMonth = (currentYear, currentMonth) => new Date(currentYear, currentMonth, 0).getDate();

export function formatDate(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours %= 12;
  hours = hours || 12;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  const ampm = hours >= 12 ? 'pm' : 'am';
  let strTime = `${hours}:${minutes}`;
  const formattedTime = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    time: `${strTime}:${ampm}`,
  };
  return formattedTime;
}

export const toTimestamp = function (strDate) {
  let datum = Date.parse(strDate);
  return datum / 1000;
};

export const groupEventsByTimestamp = (events) => {
  let result = {};
  events.forEach((event) => {
    const { start_time, stop_time } = event;

    const eventStartYear = new Date(start_time * 1000).getFullYear();
    const eventStopYear = new Date(stop_time * 1000).getFullYear();
    let currentYear = eventStartYear;
    while (currentYear <= eventStopYear) {
      const yearStartDate = toTimestamp(`01/01/${currentYear} 00:00:00`);
      const yearStopDate = toTimestamp(`12/31/${currentYear} 23:59:59`);

      const eventProps = {
        id: event.id,
        start_time: start_time >= yearStartDate ? start_time : yearStartDate,
        stop_time: stop_time <= yearStopDate ? stop_time : yearStopDate,
        tag: event.tag,
        score: event.score,
      };

      if (result[currentYear]) {
        result[currentYear].events[event.id] = eventProps;
      } else {
        result[currentYear] = {
          events: { [event.id]: eventProps },
          months: {},
        };
      }
      const eventStartMonth = new Date(result[currentYear].events[event.id].start_time * 1000).getMonth() + 1;
      const eventStopMonth = new Date(result[currentYear].events[event.id].stop_time * 1000).getMonth() + 1;
      let currentMonth = eventStartMonth;

      while (currentMonth <= eventStopMonth) {
        // const maxDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const monthDateStart = toTimestamp(`${currentMonth}/01/${currentYear} 00:00:00`);
        const monthDateStop = toTimestamp(
          `${currentMonth}/${maxDaysInMonth(currentYear, currentMonth)}/${currentYear} 23:59:59`,
        );

        let eventPerMonth = {
          id: event.id,
          start_time: start_time >= monthDateStart ? start_time : monthDateStart,
          stop_time: stop_time <= monthDateStop ? stop_time : monthDateStop,
          tag: event.tag,
          score: event.score,
          days: {},
        };

        const eventStartDay = new Date(eventPerMonth.start_time * 1000).getDate();
        const eventStopDay = new Date(eventPerMonth.stop_time * 1000).getDate();
        let currentDay = eventStartDay;

        if (result[currentYear].months[currentMonth]) {
          result[currentYear].months[currentMonth].events[event.id] = eventPerMonth;
        } else {
          result[currentYear].months[currentMonth] = {
            events: { [event.id]: eventPerMonth },
            days: {},
          };
        }

        while (currentDay <= eventStopDay) {
          const dayDateStart = toTimestamp(`${currentMonth}/${currentDay}/${currentYear} 00:00:00`);
          const dayDateStop = toTimestamp(`${currentMonth}/${currentDay}/${currentYear} 23:59:59`);

          let day = {
            id: event.id,
            start_time: start_time >= dayDateStart ? start_time : dayDateStart,
            stop_time: stop_time <= dayDateStop ? stop_time : dayDateStop,
            tag: event.tag,
            score: event.score,
          };

          result[currentYear].months[currentMonth].days[currentDay] = day;
          currentDay += 1;
        }

        currentMonth += 1;
      }
      currentYear += 1;
    }
  });
  return result;
};

export const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
export const namePattern = /^[a-zA-Z0-9._-]+$/;

export const isEmail = (value) => emailPattern.test(value);
export const isName = (value) => namePattern.test(value);
