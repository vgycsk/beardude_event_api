var webpack = require('webpack')
var path = require('path')

var ExtractTextPlugin = require('extract-text-webpack-plugin')
var WebpackCleanupPlugin = require('webpack-cleanup-plugin')
var ManifestPlugin = require('webpack-manifest-plugin')
var WebpackChunkHash = require('webpack-chunk-hash')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var plugins = [
  new WebpackCleanupPlugin({
    exclude: ['webpack.json', '.gitignore'],
    quiet: true
  }),
  new webpack.optimize.CommonsChunkPlugin({
    names: ['vendor'],
    minChunks: Infinity
  }),
  new webpack.optimize.CommonsChunkPlugin({
    names: 'core'
  }),
  new webpack.HashedModuleIdsPlugin(),
  new WebpackChunkHash(),
  new ManifestPlugin(),
  new ExtractTextPlugin({
    filename: '[name].[contenthash].css',
    allChunks: true
  }),
  new webpack.ProvidePlugin({
    'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
  }),
  new HtmlWebpackPlugin({
    template: './views/sharePage.ejs', // input
    filename: 'sharePage.ejs'
  })
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  )
}

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]

      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              query: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]__[local]___[hash:base64:5]',
                sourceMap: false
              }
            },
            {
              loader: 'postcss-loader'
            }
          ]
        })
      }
    ]
  },
  entry: {
    main: [
      'babel-polyfill', './src/index'
    ],
    vendor: [
      'react', 'react-dom', 'redux', 'react-redux', 'redux-thunk'
    ]
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '.tmp/public/js/console'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    sourceMapFilename: 'bundle.js.map',
    publicPath: '/js/console'
  },
  plugins: plugins,
  stats: {
    assets: true,
    cached: false,
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    colors: true,
    errors: true,
    errorDetails: true,
    hash: false,
    modules: false,
    publicPath: true,
    reasons: false,
    source: false,
    timings: false,
    version: false,
    warnings: false
  }
}
/*
options: {
    devtool: 'source-map',
    progress: true,
    failOnError: false,
    // watch options
    watch: true,
    keepalive: false,
    inline: true
}
*/
