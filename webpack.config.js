const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add aliases for React Native internals
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native/Libraries/Utilities/Platform$':
      'react-native-web/dist/exports/Platform',
  };

  // Ensure Webpack resolves .web.js files
  config.resolve.extensions = [
    '.web.js',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    ...config.resolve.extensions,
  ];

  return config;
};
