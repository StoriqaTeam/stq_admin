const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js',
    publicPath: process.env.PUBLIC_PATH || '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(tsx?)|(js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: [],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: true,
                localIdentName: '[local]___[hash:base64:5]',
              },
            },
            'sass-loader',
          ],
        }),
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              query: {
                modules: true,
                localIdentName: '[local]',
              },
            },
          ],
        }),
      },
    ],
  },
  /* todo: extract `devServer` block to dev.config */
  devServer:
    process.env.NODE_ENV === 'production'
      ? {}
      : {
          historyApiFallback: true,
          publicPath: '/',
          contentBase: path.join(__dirname, '../dist'),
          port: 9000,
          https: false,
          disableHostCheck: true,
        },
  devtool: 'inline-source-map',
  plugins: [
    new ExtractTextPlugin({ filename: 'styles.css' }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
