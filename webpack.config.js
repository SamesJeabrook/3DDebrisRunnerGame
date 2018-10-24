'use strict';
var webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/app.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: './dist/bundle.js'
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'es2016', 'es2017', 'stage-0']
        },
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/
      },
      {
        loaders: 'style-loader!css-loader',
        test: /\.css$/
      },
      {
        loaders: 'url-loader',
        test: /\.png$/
      }
    ]
  },
  devtool: 'cheap-module-eval-source-map'
};
