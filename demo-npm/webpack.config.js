const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  target: ['web', 'es2017'],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    module: true,
  },
  experiments: {
    topLevelAwait: true,
    outputModule: true,
  },
};
