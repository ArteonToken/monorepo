const path = require('path');
const webpack = require('webpack');
module.exports = [{
  mode: 'production',
  entry: {
    utils: './src/utils.js'
  },
  optimization: {
    minimize: false
  },
  experiments: {
    outputModule: true
  },
  output: {
    library: {
      type: 'module'
    },
    filename: '[name].esm',
    path: path.resolve(__dirname, 'dist'),
  }
}];
