const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    // Add aliases to fix module resolution
    extraNodeModules: {
      'react-native': require.resolve('react-native-web'),
      'react-native/Libraries/Utilities/Platform': require.resolve('react-native-web/dist/exports/Platform'),
    },
    // Ensure Metro resolves .web.js files for web platform
    sourceExts: [...defaultConfig.resolver.sourceExts, 'web.js', 'js', 'jsx', 'ts', 'tsx'],
  },
};