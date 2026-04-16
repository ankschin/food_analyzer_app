const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Ensure Metro scans the NativeWind cache directory at startup
const nativewindCacheDir = path.resolve(__dirname, "node_modules/.cache/nativewind");
config.watchFolders = [...(config.watchFolders || []), nativewindCacheDir];

module.exports = withNativeWind(config, {
  input: path.resolve(__dirname, "global.css").replace(/\\/g, "/"),
});
