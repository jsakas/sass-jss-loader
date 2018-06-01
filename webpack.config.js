const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'none',
  entry: {
    index: path.resolve(__dirname, 'demo/index.js'),
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
          path.join(__dirname, 'sass-jss-loader.js'),
        ],
      },
    ],
  },
  externals: [],
  plugins: [],
};
