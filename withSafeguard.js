const {
  withMainActivity,
  withAppDelegate,
  createRunOncePlugin,
} = require('@expo/config-plugins');

/**
 * Formats a Java/Kotlin map entry from a JS object
 */
function formatSecurityConfigMap(configMap, isKotlin = false) {
  const entries = Object.entries(configMap)
    .map(([key, value]) =>
      isKotlin ? `"${key}" to "${value}"` : `"${key}", "${value}"`
    )
    .join(',\n        ');

  return isKotlin
    ? `override var securityConfigMap: Map<String, String> = mapOf(\n        ${entries}\n    )`
    : `@Override\n    public Map<String, String> securityConfigMap = new HashMap<String, String>() {{\n        ${entries};\n    }};`;
}

function withSafeguardAndroid(_config, { securityConfigAndroid = {} } = {}) {
  return withMainActivity(_config, async (config) => {
    const isKotlin = config.modResults.language === 'kt';

    if (config.modResults.language === 'java') {
      config.modResults.contents = config.modResults.contents.replace(
        /public class MainActivity extends (.+) {/,
        'public class MainActivity extends com.safeguard.SafeguardReactActivity {'
      );
    } else if (isKotlin) {
      config.modResults.contents = config.modResults.contents.replace(
        /class MainActivity : (.+)\(\) \{/,
        'class MainActivity : com.safeguard.SafeguardReactActivity() {'
      );
    }

    // Add securityConfigMap override
    const securityConfigSnippet = formatSecurityConfigMap(
      securityConfigAndroid,
      isKotlin
    );

    if (isKotlin) {
      if (
        !config.modResults.contents.includes('override var securityConfigMap')
      ) {
        config.modResults.contents = config.modResults.contents.replace(
          /\{/, // Insert after class opening
          `{\n    ${securityConfigSnippet}\n`
        );
      }
    } else {
      if (
        !config.modResults.contents.includes(
          'public Map<String, String> securityConfigMap'
        )
      ) {
        config.modResults.contents = config.modResults.contents.replace(
          /\{/, // Insert after class opening
          `{\n    ${securityConfigSnippet}\n`
        );
      }
    }

    return config;
  });
}

function withSafeguardIOS(_config, { securityConfigiOS = {} } = {}) {
  return withAppDelegate(_config, async (config) => {
    const securityLevelDefaults = {
      ROOT_CHECK_STATE: 'DISABLED',
      DEVELOPER_OPTIONS_CHECK_STATE: 'WARNING',
      SIGNATURE_VERIFICATION_CHECK_STATE: 'WARNING',
      NETWORK_SECURITY_CHECK_STATE: 'WARNING',
      SCREEN_SHARING_CHECK_STATE: 'WARNING',
      APP_SPOOFING_CHECK_STATE: 'WARNING',
      KEYLOGGER_CHECK_STATE: 'WARNING',
      ONGOING_CALL_CHECK_STATE: 'WARNING',
      CERTIFICATE_MATCHING_CHECK_STATE: 'WARNING',
      EXPECTED_SIGNATURE: '',
    };

    const securityLevelMap = {
      DISABLED: 'SGSecurityLevelDisable',
      WARNING: 'SGSecurityLevelWarning',
      ERROR: 'SGSecurityLevelError',
    };

    const finalLevels = { ...securityLevelDefaults, ...securityConfigiOS };

    // Add import
    if (
      !config.modResults.contents.includes(
        '#import <SafeGuardiOS/SGSecurityChecker.h>'
      )
    ) {
      config.modResults.contents = config.modResults.contents.replace(
        /#import "AppDelegate.h"/,
        '#import "AppDelegate.h"\n#import <SafeGuardiOS/SGSecurityChecker.h>'
      );
    }

    // Add property declaration
    if (
      !config.modResults.contents.includes(
        '@property(nonatomic, strong) SGSecurityChecker *securityChecker;'
      )
    ) {
      config.modResults.contents = config.modResults.contents.replace(
        /@implementation AppDelegate/,
        '@interface AppDelegate ()\n\n@property(nonatomic, strong) SGSecurityChecker *securityChecker;\n\n@end\n\n@implementation AppDelegate'
      );
    }

    // Add security configuration
    if (
      !config.modResults.contents.includes(
        'SGSecurityConfiguration *securityConfig'
      )
    ) {
      const securitySetup = `
  SGSecurityConfiguration *securityConfig = [[SGSecurityConfiguration alloc] init];
  
  securityConfig.rootDetectionLevel = ${securityLevelMap[finalLevels.rootDetection]};
  securityConfig.developerOptionsLevel = ${securityLevelMap[finalLevels.developerOptions]};
  securityConfig.signatureVerificationLevel = ${securityLevelMap[finalLevels.signatureVerification]};
  securityConfig.networkSecurityLevel = ${securityLevelMap[finalLevels.networkSecurity]};
  securityConfig.screenSharingLevel = ${securityLevelMap[finalLevels.screenSharing]};
  securityConfig.spoofingLevel = ${securityLevelMap[finalLevels.spoofing]};
  securityConfig.reverseEngineerLevel = ${securityLevelMap[finalLevels.reverseEngineer]};
  securityConfig.keyLoggersLevel = ${securityLevelMap[finalLevels.keyLoggers]};
  securityConfig.audioCallLevel = ${securityLevelMap[finalLevels.audioCall]};
  
  securityConfig.expectedBundleIdentifier = [[NSBundle mainBundle] bundleIdentifier];
  securityConfig.expectedSignature = @"${finalLevels.expectedSignature}";
  self.securityChecker = [[SGSecurityChecker alloc] initWithConfiguration:securityConfig];
  
  self.securityChecker.alertHandler = ^(NSString *title, NSString *message, SGSecurityLevel level, void(^completion)(BOOL shouldQuit)) {
      dispatch_async(dispatch_get_main_queue(), ^{
          UIAlertController *alert = [UIAlertController alertControllerWithTitle:title
                                                                      message:message
                                                                      preferredStyle:UIAlertControllerStyleAlert];
          
          UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"OK"
                                                          style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * _Nonnull action) {
              if (completion) {
                  completion(level == SGSecurityLevelError);
              }
          }];
          
          [alert addAction:okAction];
          
          UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
          [rootViewController presentViewController:alert animated:YES completion:nil];
      });
  };`;

      config.modResults.contents = config.modResults.contents.replace(
        /self\.initialProps = @{};/,
        `self.initialProps = @{};\n${securitySetup}`
      );
    }

    // Add applicationDidBecomeActive method
    if (!config.modResults.contents.includes('applicationDidBecomeActive')) {
      config.modResults.contents = config.modResults.contents.replace(
        /@end/,
        `-(void)applicationDidBecomeActive:(UIApplication *)application {\n  [self.securityChecker performAllSecurityChecks];\n}\n\n@end`
      );
    }

    return config;
  });
}

const withSafeguard = (config, props = {}) => {
  config = withSafeguardAndroid(config, props);
  config = withSafeguardIOS(config, props);
  return config;
};

module.exports = createRunOncePlugin(withSafeguard, 'withSafeguard', '1.0.0');
