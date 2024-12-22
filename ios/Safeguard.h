#import <React/RCTBridgeModule.h>
#import <SafeGuardiOS/SGSecurityChecker.h>

@interface Safeguard : NSObject <RCTBridgeModule>

@property (nonatomic, strong) SGSecurityChecker *securityChecker;

@end
