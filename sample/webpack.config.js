const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    main: './src/index.ts',
    customElements: './src/customElements.ts',
  },
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
    }],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
      "@firebase/auth": path.resolve(__dirname, './node_modules/@firebase/auth/dist/esm2017/index.js'),
      firebaseui: path.resolve(__dirname, '../dist/custom-elements/index.js')
    },
  },
  output: {
    filename: '[name]-bundle.[contenthash].js',
    module: true,
    path: path.resolve(__dirname, 'dist'),
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new CopyPlugin({
        patterns: [
          { from: "../dist/firebaseui/assets", to: "firebaseui/assets" },
          { from: "./src/*.[!ts]*", to: () => "[name].[ext]" },
        ],
    }),
  ]
};