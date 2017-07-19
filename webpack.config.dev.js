var webpack = require('webpack')
var path = require('path')

var WebpackCleanupPlugin = require('webpack-cleanup-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: path.resolve(__dirname, './'),

  entry: {
    main: [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/only-dev-server',
      'babel-polyfill',
      './src/index.js'
    ]
  },

  plugins: [
    new WebpackCleanupPlugin({
      exclude: ['webpack.json', '.gitignore'],
      quiet: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        WEBPACK: true
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './views/sharePage.ejs', // input
      filename: 'sharePage.ejs',
      favicon: './src/assets/imgs/favicon.ico'
    })
  ],

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: { presets: ['es2015', 'react', 'stage-3'] }
          }
        ]

      },
      {
        test: /\.(png|jpg|woff)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      },
      {
        test: /\.(css)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            query: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      }
    ]
  },

  resolve: {
    extensions: ['*', '.js', '.jsx', 'css'],
    modules: ['node_modules']
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: 'bundle.js',
    sourceMapFilename: 'bundle.map'
  },

  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    hot: true,
    publicPath: '/',
    historyApiFallback: true,
    proxy: {
      '/api/**/**': {
        target: 'http://localhost:1337',
        secure: false,
        changeOrigin: true
      }
    }
  }
}
