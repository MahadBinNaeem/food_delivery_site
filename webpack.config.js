const path    = require("path")
const webpack = require("webpack")

module.exports = {
  entry: './app/javascript/application.js',
  output: {
    filename: 'application.js',
    path: path.resolve(__dirname, 'app/assets/builds'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // handles .js and .jsx
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'] // allow imports without specifying extensions
  }
};
