#import "Safeguard.h"
#import <SafeGuardiOS/SGSecurityConfiguration.h>

@implementation Safeguard
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(initialize:(NSDictionary *)config
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    @try {
        SGSecurityConfiguration *securityConfig = [[SGSecurityConfiguration alloc] init];
        
        // Set security levels from config
        securityConfig.rootDetectionLevel = [self securityLevelFromString:config[@"rootCheckState"] defaultValue:SGSecurityLevelError];
        securityConfig.developerOptionsLevel = [self securityLevelFromString:config[@"developerOptionsCheckState"] defaultValue:SGSecurityLevelWarning];
        securityConfig.signatureVerificationLevel = [self securityLevelFromString:config[@"malwareCheckState"] defaultValue:SGSecurityLevelWarning];
        securityConfig.networkSecurityLevel = [self securityLevelFromString:config[@"networkSecurityCheckState"] defaultValue:SGSecurityLevelWarning];
        securityConfig.screenSharingLevel = [self securityLevelFromString:config[@"screenSharingCheckState"] defaultValue:SGSecurityLevelWarning];
        securityConfig.spoofingLevel = [self securityLevelFromString:config[@"appSpoofingCheckState"] defaultValue:SGSecurityLevelWarning];
        securityConfig.reverseEngineerLevel = [self securityLevelFromString:config[@"tamperingCheckState"] defaultValue:SGSecurityLevelWarning];
        securityConfig.keyLoggersLevel = [self securityLevelFromString:config[@"keyloggerCheckState"] defaultValue:SGSecurityLevelWarning];
        securityConfig.audioCallLevel = [self securityLevelFromString:config[@"ongoingCallCheckState"] defaultValue:SGSecurityLevelWarning];
        
        // Set expected identifiers
        securityConfig.expectedBundleIdentifier = config[@"expectedPackageName"] ?: [[NSBundle mainBundle] bundleIdentifier];
        securityConfig.expectedSignature = config[@"expectedCertificateHash"] ?: @"";
        
        self.securityChecker = [[SGSecurityChecker alloc] initWithConfiguration:securityConfig];
        
        // Set up alert handler
        self.securityChecker.alertHandler = ^(NSString *title, NSString *message, SGSecurityLevel level, void(^completion)(BOOL shouldQuit)) {
            dispatch_async(dispatch_get_main_queue(), ^{
                UIAlertController *alert = [UIAlertController alertControllerWithTitle:title
                                                                            message:message
                                                                            preferredStyle:UIAlertControllerStyleAlert];
                
                UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"OK"
                                                                style:UIAlertActionStyleDefault
                                                                handler:^(UIAlertAction * _Nonnull action) {
                    if (completion) {
                        completion(YES);
                    }
                }];
                
                [alert addAction:okAction];
                
                UIViewController *rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
                [rootViewController presentViewController:alert animated:YES completion:nil];
            });
        };
        
        resolve(nil);
    } @catch (NSException *exception) {
        reject(@"INIT_ERROR", exception.reason, nil);
    }
}

RCT_EXPORT_METHOD(checkAll:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (!self.securityChecker) {
        reject(@"NOT_INITIALIZED", @"SecurityChecker not initialized. Call initialize() first.", nil);
        return;
    }
    
    [self.securityChecker performAllSecurityChecks];
    resolve(@"");
}

RCT_EXPORT_METHOD(checkRoot:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (!self.securityChecker) {
        reject(@"NOT_INITIALIZED", @"SecurityChecker not initialized. Call initialize() first.", nil);
        return;
    }
    
    [self.securityChecker checkRoot];
    resolve(@"OK");
}

RCT_EXPORT_METHOD(checkDeveloperOptions:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (!self.securityChecker) {
        reject(@"NOT_INITIALIZED", @"SecurityChecker not initialized. Call initialize() first.", nil);
        return;
    }
    
    [self.securityChecker checkDeveloperOptions];
    resolve(@"OK");
}

RCT_EXPORT_METHOD(checkMalware:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (!self.securityChecker) {
        reject(@"NOT_INITIALIZED", @"SecurityChecker not initialized. Call initialize() first.", nil);
        return;
    }
    resolve(@"OK");
}

RCT_EXPORT_METHOD(checkNetwork:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (!self.securityChecker) {
        reject(@"NOT_INITIALIZED", @"SecurityChecker not initialized. Call initialize() first.", nil);
        return;
    }
    
    [self.securityChecker checkNetworkSecurity];
    resolve(@"OK");
}

RCT_EXPORT_METHOD(checkScreenMirroring:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (!self.securityChecker) {
        reject(@"NOT_INITIALIZED", @"SecurityChecker not initialized. Call initialize() first.", nil);
        return;
    }
    
    [self.securityChecker checkScreenSharing];
    resolve(@"OK");
}

RCT_EXPORT_METHOD(checkApplicationSpoofing:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (!self.securityChecker) {
        reject(@"NOT_INITIALIZED", @"SecurityChecker not initialized. Call initialize() first.", nil);
        return;
    }
    resolve(@"OK");
}

RCT_EXPORT_METHOD(checkKeyLogger:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (!self.securityChecker) {
        reject(@"NOT_INITIALIZED", @"SecurityChecker not initialized. Call initialize() first.", nil);
        return;
    }
    
    resolve(@"OK");
}

#pragma mark - Helper Methods

- (SGSecurityLevel)securityLevelFromString:(NSString *)levelString defaultValue:(SGSecurityLevel)defaultLevel {
    if (!levelString) {
        return defaultLevel;
    }
    
    if ([levelString isEqualToString:@"ERROR"]) {
        return SGSecurityLevelError;
    } else if ([levelString isEqualToString:@"WARNING"]) {
        return SGSecurityLevelWarning;
    } else if ([levelString isEqualToString:@"DISABLED"]) {
        return SGSecurityLevelDisable;
    }
    
    return defaultLevel;
}

@end
