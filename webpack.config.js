'use strict';

var ENV = process.env.npm_lifecycle_event;
var isProd = ENV === 'build';

var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var paths = {
  src: path.resolve(__dirname + '/src'),
  dist: path.resolve(__dirname + '/dist'),
  srcPublic: path.resolve(__dirname + '/src/public')
};

module.exports = {
  context: paths.src,
  entry: {
    app: './app.js'
  },
  output: {
    path: paths.dist,
    publicPath: isProd ? '/weight-tracker' : '/',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.json$/,
        exclude: /node_modules/,
        loader: 'json-loader'
      },
      { 
        test: /\.css$/, 
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader') 
      }
    ]
  },
  plugins: (function() {
    var plugins = [
      new ExtractTextPlugin('[name].css')
    ]
    if (isProd) {
      return plugins.concat([
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new CopyWebpackPlugin([{
          from: paths.srcPublic
        }])
      ])
    }
    return plugins;
  })(),
  devServer: {
    contentBase: paths.srcPublic,
    stats: 'minimal'
  }
};