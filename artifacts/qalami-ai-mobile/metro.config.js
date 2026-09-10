const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [__dirname];
config.resolver.blockList = [
  /\/\.cache\/.*/,
  /\/static-build\/.*/,
];

module.exports = config;
