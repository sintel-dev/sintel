export const getMatrixSize = () => {
  const wrapper = document.querySelector('.matrix');
  const width = wrapper.clientWidth - 10;
  const height = wrapper.clientHeight - 10;
  return { width, height };
};
