const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const packages = require('./package.json');

const BUILD = process.env.BABEL_ENV = process.env.NODE_ENV;

const PATHS = {
  app: path.join(__dirname, 'app'),
  server: path.join(__dirname, 'server/entry.jsx'),
  dist: path.join(__dirname, 'dist/server'),
};

const common = {
  output: {
    path: PATHS.dist,
    publicPath: '/'
  },
  target: 'node',
  externals: fs.readdirSync('node_modules'),
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: [PATHS.app, PATHS.server]
      },
      { test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: ['file?name=img/[hash].[ext]', 'img?-minimize']
      },
      {
        test: /\.ejs$/,
        loaders: ['babel-loader', 'ejs-html-loader']
      }
    ]
  }
};

const different = function(build) {
  switch(build) {
    case "development":
      return {
      };
    case "production":
      return {
        entry: PATHS.server,
        output: {
          filename: 'entry.js',
          libraryTarget: 'commonjs2'
        },
        module: {
          loaders: [
            {
              test: /\.sass$/,
              loader: ExtractTextPlugin.extract({
                notExtractLoader: 'style',
                loader: ['css', 'sass?indentedSyntax=true']
              }),
              include: PATHS.app
            }
          ]
        },
        plugins: [
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify("production")
            }
          }),
          new ExtractTextPlugin("css/[chunkhash].css"),
          // new webpack.optimize.UglifyJsPlugin({
          //   compress: {warnings: false}
          // })
        ]
      };
    default:
      return {};
  }
}(BUILD);

module.exports = merge(common, different);
