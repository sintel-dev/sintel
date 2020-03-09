export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fromMonthToIndex = month => months.indexOf(month) + 1;
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
