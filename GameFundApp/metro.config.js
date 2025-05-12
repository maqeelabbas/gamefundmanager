const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// For NativeWind 2.0
config.resolver.sourceExts.push('css');

module.exports = config;
