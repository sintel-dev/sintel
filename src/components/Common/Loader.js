import React from 'react';

const Loader = (props) => {
  const { isLoading } = props;

  console.log(isLoading);
  return (
    isLoading ? 'Is Loading' :
    <div className="loading">
      {props.children}
    </div>
    );
};

export default Loader;
