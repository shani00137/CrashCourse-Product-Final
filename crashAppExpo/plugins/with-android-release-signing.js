const { withAppBuildGradle, createRunOncePlugin } = require('expo/config-plugins');

const MARKER = 'PLAY_UPLOAD_KEY_SIGNING';

// Google Play only accepts uploads signed with the app's registered upload key.
// `expo prebuild` regenerates android/app/build.gradle from a template that
// points the `release` build type at the debug keystore, which produces an AAB
// signed with the stock Android debug certificate and gets rejected. This mod
// (re)wires `release` to the real upload key on every prebuild.
const RELEASE_SIGNING_CONFIG = `
        // ${MARKER}: use the Play upload key, never the debug key.
        release {
            // Credentials live in <projectRoot>/keystore.properties (gitignored).
            def keystorePropertiesFile = rootProject.file("../keystore.properties")
            if (keystorePropertiesFile.exists()) {
                def keystoreProperties = new Properties()
                keystorePropertiesFile.withInputStream { keystoreProperties.load(it) }
                storeFile rootProject.file("../" + keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }`;

function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error(
        'with-android-release-signing: expected a Groovy android/app/build.gradle'
      );
    }

    let contents = config.modResults.contents;
    if (contents.includes(MARKER)) {
      return config;
    }

    if (!/\bsigningConfigs\s*\{/.test(contents)) {
      throw new Error(
        'with-android-release-signing: could not find signingConfigs block in android/app/build.gradle'
      );
    }
    contents = contents.replace(
      /signingConfigs\s*\{/,
      (match) => `${match}${RELEASE_SIGNING_CONFIG}`
    );

    // Only rewrite the `signingConfig` inside buildTypes.release (the debug
    // build type must keep using the debug keystore).
    const releaseBlock = /(buildTypes\s*\{[\s\S]*?\brelease\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/;
    if (!releaseBlock.test(contents)) {
      throw new Error(
        'with-android-release-signing: could not find "signingConfig signingConfigs.debug" in buildTypes.release'
      );
    }
    contents = contents.replace(
      releaseBlock,
      '$1signingConfig signingConfigs.release'
    );

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = createRunOncePlugin(
  withAndroidReleaseSigning,
  'with-android-release-signing',
  '1.0.0'
);
