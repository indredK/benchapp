const { withAppBuildGradle } = require('expo/config-plugins');

/** 启用 ABI 拆分：每个架构一个独立 APK，减少通用包体积 */
function withAndroidSplits(config) {
  return withAppBuildGradle(config, (cfg) => {
    const code = `
android {
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a", "armeabi-v7a"
            universalApk false
        }
    }
}
`;
    if (!cfg.modResults.contents.includes('splits {')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(/android\s*\{/, `android {${code}`);
    }
    return cfg;
  });
}

module.exports = withAndroidSplits;
