const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Use expo-fetch to resolve whatwg-fetch
config.resolver.alias = {
    'whatwg-fetch': 'expo-fetch',
};

module.exports = withNativeWind(config, { input: './global.css' });