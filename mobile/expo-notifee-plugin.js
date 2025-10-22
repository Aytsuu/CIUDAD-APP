const { withAndroidManifest } = require('@expo/config-plugins');

const withNotifee = (config) => {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    
    // Add Notifee service
    if (!mainApplication.service) {
      mainApplication.service = [];
    }
    
    mainApplication.service.push({
      $: {
        'android:name': 'app.notifee.core.ForegroundService',
        'android:enabled': 'true',
        'android:exported': 'false',
        'android:foregroundServiceType': 'dataSync',
      },
    });
    
    return config;
  });
};

module.exports = withNotifee;