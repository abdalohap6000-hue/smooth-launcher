const { getDefaultConfig } = require('expo/metro-config');
const { exclusionList } = require('metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [__dirname];
config.resolver.blockList = exclusionList([
  /\/\.cache\/.*/,
  /\/static-build\/.*/,
]);

module.exports = config;
