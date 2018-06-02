const path = require('path');
const fs = require('fs');

module.exports = {
  mode: 'none',
  entry: {
    index: path.resolve(__dirname, 'index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname),
        ],
        exclude: path.resolve(__dirname, 'node_modules/'),
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          // 'sass-jss-loader',
          path.join(__dirname, '../sass-jss-loader.js'),
        ],
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname),
    port: 1234,
  },
  externals: [],
  plugins: [],
};
