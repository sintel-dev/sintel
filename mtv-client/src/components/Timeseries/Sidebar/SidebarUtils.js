export const getWrapperSize = () => {
  const siderbarHeaderHeight = document.querySelector('.sidebar-heading').clientHeight;
  const wrapper = document.querySelector('#dataWrapper');

  const width = wrapper.clientWidth;
  const height = wrapper.clientHeight - siderbarHeaderHeight;
  return { width, height };
};
