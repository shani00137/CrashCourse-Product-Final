const { withProjectBuildGradle, createRunOncePlugin } = require('expo/config-plugins');

const MARKER = 'ANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES';

// Google Play requires native libraries to support 16 KB memory page sizes on
// Android 15+. NDK r27 only aligns to 16 KB when this flag is set, so libraries
// compiled from source (e.g. onnxruntime-react-native's libonnxruntimejsi.so)
// otherwise stay 4 KB aligned and the app is rejected/warned about.
const HOOK = `
// 16 KB page size support (required by Google Play for Android 15+).
def ccApply16kb = { subproject ->
  try {
    def androidExt = subproject.extensions.findByName('android')
    if (androidExt == null) return
    def cmakePath = androidExt.externalNativeBuild.cmake.path
    if (cmakePath == null) {
      cmakePath = androidExt.defaultConfig.externalNativeBuild.cmake.path
    }
    if (cmakePath != null) {
      androidExt.defaultConfig.externalNativeBuild.cmake.arguments '-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON'
    }
  } catch (Exception ignored) {
  }
}
subprojects { subproject ->
  if (subproject.state.executed) {
    ccApply16kb(subproject)
  } else {
    subproject.afterEvaluate { ccApply16kb(subproject) }
  }
}
`;

function withAndroid16Kb(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy' && !config.modResults.contents.includes(MARKER)) {
      config.modResults.contents += HOOK;
    }
    return config;
  });
}

module.exports = createRunOncePlugin(withAndroid16Kb, 'with-android-16kb-page-size', '1.0.0');
