const { expo } = require('./app.json');

const allowedPlugins = new Set(['expo-router']);
const normalizedPlugins = Array.isArray(expo.plugins)
  ? expo.plugins.filter((plugin) => {
      const name = Array.isArray(plugin) ? plugin[0] : plugin;
      return allowedPlugins.has(name);
    })
  : [];

module.exports = {
  expo: {
    ...expo,
    plugins: normalizedPlugins,
  },
};
