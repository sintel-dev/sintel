const webpack = require('webpack');
const path = require('path');
const commonConfig = require('./webpack.conf');

module.exports = (options) => {
  const releaseConfig = Object.assign({}, commonConfig(options));
  releaseConfig.devtool = 'sourcemap';
  releaseConfig.mode = 'production';

  if (options.isNodeLibrary) {
    // dont want to minimise library code
    releaseConfig.optimization = {
      minimize: false
    }
  }

  return releaseConfig;
};
