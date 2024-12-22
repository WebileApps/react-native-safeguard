import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-safeguard' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Safeguard = NativeModules.Safeguard
  ? NativeModules.Safeguard
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export type SecurityCheckState = 'SECURE' | 'WARNING' | 'ERROR';

export interface SecurityConfig {
  rootCheckState?: SecurityCheckState;
  developerOptionsCheckState?: SecurityCheckState;
  malwareCheckState?: SecurityCheckState;
  tamperingCheckState?: SecurityCheckState;
  networkSecurityCheckState?: SecurityCheckState;
  screenSharingCheckState?: SecurityCheckState;
  appSpoofingCheckState?: SecurityCheckState;
  keyloggerCheckState?: SecurityCheckState;
  ongoingCallCheckState?: SecurityCheckState;
  certificateMatchingCheckState?: SecurityCheckState;
  expectedPackageName?: string;
  expectedCertificateHash?: string;
}

export interface SecurityCheckResult {
  status: SecurityCheckState;
  message: string;
}

export function initialize(config: SecurityConfig = {}): Promise<void> {
  return Safeguard.initialize(config);
}

export function checkAll(): Promise<SecurityCheckResult> {
  return Safeguard.checkAll();
}

export function checkRoot(): Promise<SecurityCheckResult> {
  return Safeguard.checkRoot();
}

export function checkDeveloperOptions(): Promise<SecurityCheckResult> {
  return Safeguard.checkDeveloperOptions();
}

export function checkMalware(): Promise<SecurityCheckResult> {
  return Safeguard.checkMalware();
}

export function checkNetwork(): Promise<SecurityCheckResult> {
  return Safeguard.checkNetwork();
}

export function checkScreenMirroring(): Promise<SecurityCheckResult> {
  return Safeguard.checkScreenMirroring();
}

export function checkApplicationSpoofing(): Promise<SecurityCheckResult> {
  return Safeguard.checkApplicationSpoofing();
}

export function checkKeyLogger(): Promise<SecurityCheckResult> {
  return Safeguard.checkKeyLogger();
}

export default {
  initialize,
  checkAll,
  checkRoot,
  checkDeveloperOptions,
  checkMalware,
  checkNetwork,
  checkScreenMirroring,
  checkApplicationSpoofing,
  checkKeyLogger,
};
