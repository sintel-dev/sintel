export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fromMonthToIndex = month => months.indexOf(month) + 1;
export const maxDaysInMonth = (currentYear, currentMonth) => new Date(currentYear, currentMonth, 0).getDate();
