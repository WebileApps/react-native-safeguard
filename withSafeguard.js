const {
  withMainActivity,
  withAppDelegate,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const {
  mergeContents,
} = require('@expo/config-plugins/build/utils/generateCode');

/**
 * Formats a Java/Kotlin map entry from a JS object
 */
function formatSecurityConfigMap(configMap, isKotlin = false) {
  const entries = Object.entries(configMap)
    .map(([key, value]) =>
      isKotlin ? `"${key}" to "${value}"` : `"${key}", "${value}"`
    )
    .join(',\n\t\t');

  return isKotlin
    ? `\toverride val securityConfigMap: Map<String, String> = mapOf(\n\t\t${entries}\n\t)`
    : `\t@Override\n    public Map<String, String> securityConfigMap = new HashMap<String, String>() {{\n        ${entries};\n    }};`;
}

function withSafeguardAndroid(_config, { securityConfigAndroid = {} } = {}) {
  return withMainActivity(_config, async (config) => {
    const isKotlin = config.modResults.language === 'kt';

    const activitySuperClass = isKotlin
      ? 'class MainActivity : com.safeguard.SafeguardReactActivity() {'
      : 'public class MainActivity extends com.safeguard.SafeguardReactActivity {';

    const activityClassMatcher = isKotlin
      ? 'class MainActivity : ReactActivity() {'
      : /public class MainActivity extends (.+) {/;

    config.modResults.contents = config.modResults.contents.replace(
      activityClassMatcher,
      activitySuperClass
    );

    // Add securityConfigMap override
    const securityConfigSnippet = formatSecurityConfigMap(
      securityConfigAndroid,
      isKotlin
    );

    config.modResults.contents = mergeContents({
      tag: 'safeguard-android/security-config',
      src: config.modResults.contents,
      newSrc: securityConfigSnippet,
      anchor: /override fun onCreate(.+) {/, // Insert before onCreate
      offset: 0,
      comment: '//',
    }).contents;

    return config;
  });
}

function withSafeguardIOS(_config, { securityConfigiOS = {} } = {}) {
  return withAppDelegate(_config, async (config) => {
    const isSwift = config.modResults.language === 'swift';

    const securityLevelDefaults = {
      ROOT_CHECK_STATE: 'DISABLED',
      DEVELOPER_OPTIONS_CHECK_STATE: 'WARNING',
      SIGNATURE_VERIFICATION_CHECK_STATE: 'WARNING',
      NETWORK_SECURITY_CHECK_STATE: 'WARNING',
      SCREEN_SHARING_CHECK_STATE: 'WARNING',
      APP_SPOOFING_CHECK_STATE: 'WARNING',
      REVERSE_ENGINEERING_CHECK_STATE: 'WARNING',
      KEYLOGGER_CHECK_STATE: 'WARNING',
      ONGOING_CALL_CHECK_STATE: 'WARNING',
      CERTIFICATE_MATCHING_CHECK_STATE: 'WARNING',
      SIGNATURE_ERROR_DEBUG: false,
      EXPECTED_SIGNATURE: '',
      EXPECTED_PACKAGE_NAME: '',
      EXPECTED_BUNDLE_IDENTIFIER: '',
      CRITICAL_DIALOG_TITLE: 'Security Alert',
      WARNING_DIALOG_TITLE: 'Security Warning',
      CRITICAL_DIALOG_POSITIVE_BUTTON: 'Quit',
      WARNING_DIALOG_POSITIVE_BUTTON: 'Continue',
      CRITICAL_DIALOG_NEGATIVE_BUTTON: 'Cancel',
      WARNING_DIALOG_NEGATIVE_BUTTON: 'Cancel',
    };

    const finalLevels = { ...securityLevelDefaults, ...securityConfigiOS };

    if (isSwift) {
      // Handle Swift AppDelegate
      const securityLevelMap = {
        DISABLED: '.disable',
        WARNING: '.warning',
        ERROR: '.error',
      };

      // Add import
      config.modResults.contents = mergeContents({
        tag: 'safeguard-ios/import',
        src: config.modResults.contents,
        newSrc: 'import SafeGuardiOS',
        anchor: /import React/,
        offset: 1,
        comment: '//',
      }).contents;

      // Add property declaration
      const propertyDeclaration = `  private var securityChecker: SGSecurityChecker?`;

      config.modResults.contents = mergeContents({
        tag: 'safeguard-ios/property',
        src: config.modResults.contents,
        newSrc: propertyDeclaration,
        anchor: /var reactNativeFactory: RCTReactNativeFactory\?/,
        offset: 1,
        comment: '//',
      }).contents;

      // Add security configuration in didFinishLaunchingWithOptions
      const securitySetup = `
    let securityConfig = SGSecurityConfiguration()
    
    securityConfig.rootDetectionLevel = ${securityLevelMap[finalLevels.ROOT_CHECK_STATE]}
    securityConfig.developerOptionsLevel = ${securityLevelMap[finalLevels.DEVELOPER_OPTIONS_CHECK_STATE]}
    securityConfig.signatureVerificationLevel = ${securityLevelMap[finalLevels.SIGNATURE_VERIFICATION_CHECK_STATE]}
    securityConfig.signatureErrorDebug = ${finalLevels.SIGNATURE_ERROR_DEBUG ? 'true' : 'false'}
    securityConfig.networkSecurityLevel = ${securityLevelMap[finalLevels.NETWORK_SECURITY_CHECK_STATE]}
    securityConfig.screenSharingLevel = ${securityLevelMap[finalLevels.SCREEN_SHARING_CHECK_STATE]}
    securityConfig.spoofingLevel = ${securityLevelMap[finalLevels.APP_SPOOFING_CHECK_STATE]}
    securityConfig.reverseEngineerLevel = ${securityLevelMap[finalLevels.REVERSE_ENGINEERING_CHECK_STATE]}
    securityConfig.keyLoggersLevel = ${securityLevelMap[finalLevels.KEYLOGGER_CHECK_STATE]}
    securityConfig.audioCallLevel = ${securityLevelMap[finalLevels.ONGOING_CALL_CHECK_STATE]}
    
    securityConfig.expectedBundleIdentifier = "${finalLevels.EXPECTED_BUNDLE_IDENTIFIER}"
    securityConfig.expectedSignature = "${finalLevels.EXPECTED_SIGNATURE}"
    
    securityChecker = SGSecurityChecker(configuration: securityConfig)
    
    securityChecker?.alertHandler = { title, message, level, completion in
      DispatchQueue.main.async {
        let alertTitle = level == .error ? "${finalLevels.CRITICAL_DIALOG_TITLE}" : "${finalLevels.WARNING_DIALOG_TITLE}"
        let positiveButtonTitle = level == .error ? "${finalLevels.CRITICAL_DIALOG_POSITIVE_BUTTON}" : "${finalLevels.WARNING_DIALOG_POSITIVE_BUTTON}"
        
        let alert = UIAlertController(title: alertTitle, message: message, preferredStyle: .alert)
        
        let okAction = UIAlertAction(title: positiveButtonTitle, style: .default) { _ in
          if let completion = completion {
            completion(level == .error)
          }
        }
        
        alert.addAction(okAction)
        
        if let rootViewController = UIApplication.shared.delegate?.window??.rootViewController {
          rootViewController.present(alert, animated: true, completion: nil)
        }
      }
    }
`;

      config.modResults.contents = mergeContents({
        tag: 'safeguard-ios/security-setup',
        src: config.modResults.contents,
        newSrc: securitySetup,
        anchor:
          /return super\.application\(application, didFinishLaunchingWithOptions: launchOptions\)/,
        offset: 0,
        comment: '//',
      }).contents;

      // Add applicationDidBecomeActive method after the last method in AppDelegate
      const applicationDidBecomeActiveMethod = `
  public override func applicationDidBecomeActive(_ application: UIApplication) {
    securityChecker?.performAllSecurityChecks()
    super.applicationDidBecomeActive(application)
  }
`;

      config.modResults.contents = mergeContents({
        tag: 'safeguard-ios/application-did-become-active',
        src: config.modResults.contents,
        newSrc: applicationDidBecomeActiveMethod,
        anchor:
          /return super\.application\(application, continue: userActivity, restorationHandler: restorationHandler\) \|\| result/,
        offset: 2,
        comment: '//',
      }).contents;
    } else {
      // Handle Objective-C AppDelegate
      const securityLevelMap = {
        DISABLED: 'SGSecurityLevelDisable',
        WARNING: 'SGSecurityLevelWarning',
        ERROR: 'SGSecurityLevelError',
      };

      // Add import
      config.modResults.contents = mergeContents({
        tag: 'safeguard-ios/import',
        src: config.modResults.contents,
        newSrc: '#import <SafeGuardiOS/SGSecurityChecker.h>',
        anchor: /#import "AppDelegate.h"/,
        offset: 1,
        comment: '//',
      }).contents;

      // Add applicationDidBecomeActive method
      const applicationDidBecomeActiveMethod = `-(void)applicationDidBecomeActive:(UIApplication *)application {
  [self.securityChecker performAllSecurityChecks];
}`;

      config.modResults.contents = mergeContents({
        tag: 'safeguard-ios/application-did-become-active',
        src: config.modResults.contents,
        newSrc: applicationDidBecomeActiveMethod,
        anchor: /@implementation AppDelegate/,
        offset: 1,
        comment: '//',
      }).contents;

      // Add property declaration
      const propertyDeclaration =
        '@interface AppDelegate ()\n\n@property(nonatomic, strong) SGSecurityChecker *securityChecker;\n\n@end';

      config.modResults.contents = mergeContents({
        tag: 'safeguard-ios/property',
        src: config.modResults.contents,
        newSrc: propertyDeclaration,
        anchor: /@implementation AppDelegate/,
        offset: 0,
        comment: '//',
      }).contents;

      // Add security configuration
      const securitySetup = `
  SGSecurityConfiguration *securityConfig = [[SGSecurityConfiguration alloc] init];
  
  securityConfig.rootDetectionLevel = ${securityLevelMap[finalLevels.ROOT_CHECK_STATE]};
  securityConfig.developerOptionsLevel = ${securityLevelMap[finalLevels.DEVELOPER_OPTIONS_CHECK_STATE]};
  securityConfig.signatureVerificationLevel = ${securityLevelMap[finalLevels.SIGNATURE_VERIFICATION_CHECK_STATE]};
  securityConfig.signatureErrorDebug = ${finalLevels.SIGNATURE_ERROR_DEBUG ? 'YES' : 'NO'};
  securityConfig.networkSecurityLevel = ${securityLevelMap[finalLevels.NETWORK_SECURITY_CHECK_STATE]};
  securityConfig.screenSharingLevel = ${securityLevelMap[finalLevels.SCREEN_SHARING_CHECK_STATE]};
  securityConfig.spoofingLevel = ${securityLevelMap[finalLevels.APP_SPOOFING_CHECK_STATE]};
  securityConfig.reverseEngineerLevel = ${securityLevelMap[finalLevels.REVERSE_ENGINEERING_CHECK_STATE]};
  securityConfig.keyLoggersLevel = ${securityLevelMap[finalLevels.KEYLOGGER_CHECK_STATE]};
  securityConfig.audioCallLevel = ${securityLevelMap[finalLevels.ONGOING_CALL_CHECK_STATE]};
  
  securityConfig.expectedBundleIdentifier = @"${finalLevels.EXPECTED_BUNDLE_IDENTIFIER}";
  securityConfig.expectedSignature = @"${finalLevels.EXPECTED_SIGNATURE}";
  self.securityChecker = [[SGSecurityChecker alloc] initWithConfiguration:securityConfig];
  
  self.securityChecker.alertHandler = ^(NSString *title, NSString *message, SGSecurityLevel level, void(^completion)(BOOL shouldQuit)) {
      dispatch_async(dispatch_get_main_queue(), ^{
          NSString *alertTitle = level == SGSecurityLevelError ? @"${finalLevels.CRITICAL_DIALOG_TITLE}" : @"${finalLevels.WARNING_DIALOG_TITLE}";
          NSString *positiveButtonTitle = level == SGSecurityLevelError ? @"${finalLevels.CRITICAL_DIALOG_POSITIVE_BUTTON}" : @"${finalLevels.WARNING_DIALOG_POSITIVE_BUTTON}";
          
          UIAlertController *alert = [UIAlertController alertControllerWithTitle:alertTitle
                                                                      message:message
                                                                      preferredStyle:UIAlertControllerStyleAlert];
          
          UIAlertAction *okAction = [UIAlertAction actionWithTitle:positiveButtonTitle
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

      config.modResults.contents = mergeContents({
        tag: 'safeguard-ios/security-setup',
        src: config.modResults.contents,
        newSrc: securitySetup,
        anchor: /self\.initialProps = @{};/,
        offset: 1,
        comment: '//',
      }).contents;
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
