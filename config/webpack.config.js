const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  return {
    mode: env.production ? 'production' : 'development',
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: 'bundle.js',
      publicPath: env.appSubpath,
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

    devServer: env.production
      ? {}
      : {
          historyApiFallback: true,
          publicPath: '/',
          contentBase: path.join(__dirname, '../dist'),
          port: 9000,
          https: false,
          disableHostCheck: true,
        },
    devtool: env.production ? 'eval' : 'inline-source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.PUBLIC_PATH': JSON.stringify(env.appSubpath),
        'process.env.GRAPHQL_URL':
          JSON.stringify(env.endpoint) ||
          JSON.stringify('https://nightly.stq.cloud/graphql'),
        'process.env.PRODUCT_URL': JSON.stringify(env.productUrl),
      }),
      new ExtractTextPlugin({ filename: 'styles.css' }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
  };
};
