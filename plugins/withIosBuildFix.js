const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withIosBuildFix = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = fs.readFileSync(podfilePath, "utf-8");

      const buildFix = `
    # [withIosBuildFix] Fix pod compilation with Xcode 26+ / SDK 26+
    # MUST run AFTER react_native_post_install to avoid being overridden
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        if bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 15.1
          bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        end
        if target.name == 'fmt'
          bc.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end`;

      // Insert AFTER react_native_post_install(...) so our settings aren't overridden.
      // Regex handles multi-line calls with one level of nested parens.
      const rnPostInstallRegex =
        /(react_native_post_install\((?:[^()]|\([^()]*\))*\))/;

      if (rnPostInstallRegex.test(contents)) {
        contents = contents.replace(
          rnPostInstallRegex,
          `$1\n${buildFix}`
        );
      } else {
        // Fallback: insert after post_install do |installer|
        contents = contents.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|\n${buildFix}`
        );
      }

      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);
};

module.exports = withIosBuildFix;
