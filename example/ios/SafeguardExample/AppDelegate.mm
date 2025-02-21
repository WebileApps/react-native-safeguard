#import "AppDelegate.h"
#import <SafeGuardiOS/SGSecurityChecker.h>

#import <React/RCTBundleURLProvider.h>

@interface AppDelegate ()

@property(nonatomic, strong) SGSecurityChecker *securityChecker;

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"SafeguardExample";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  SGSecurityConfiguration *securityConfig = [[SGSecurityConfiguration alloc] init];
  
  // Set security levels from config
  securityConfig.rootDetectionLevel = SGSecurityLevelWarning;
  securityConfig.developerOptionsLevel = SGSecurityLevelWarning;
  securityConfig.signatureVerificationLevel = SGSecurityLevelWarning;
  securityConfig.networkSecurityLevel = SGSecurityLevelWarning;
  securityConfig.screenSharingLevel = SGSecurityLevelWarning;
  securityConfig.spoofingLevel = SGSecurityLevelWarning;
  securityConfig.reverseEngineerLevel = SGSecurityLevelWarning;
  securityConfig.keyLoggersLevel = SGSecurityLevelWarning;
  securityConfig.signatureVerificationLevel = SGSecurityLevelDisable;
  securityConfig.audioCallLevel = SGSecurityLevelWarning;
  
  // Set expected identifiers
  securityConfig.expectedBundleIdentifier = [[NSBundle mainBundle] bundleIdentifier];
  securityConfig.expectedSignature = @"";
  self.securityChecker = [[SGSecurityChecker alloc] initWithConfiguration:securityConfig];
//  [self.securityChecker performAllSecurityChecks];
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
  };
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

-(void)applicationDidBecomeActive:(UIApplication *)application {
  [self.securityChecker performAllSecurityChecks];
}

@end
