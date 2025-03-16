# react-native-safeguard

A comprehensive security library for React Native applications that helps protect against various security threats including root detection, malware, tampering, and more.

## Features

- Root/Jailbreak Detection
- Developer Options Detection
- Network Security Checks
- Malware and Tampering Detection
- Screen Mirroring Detection
- App Spoofing Prevention
- Key Logger Detection
- Configurable Security Levels (SECURE, WARNING, ERROR)

## Installation

### React Native CLI

```sh
npm install react-native-safeguard
# or
yarn add react-native-safeguard
```

### Expo

```sh
expocli install react-native-safeguard
```

Then add the config plugin to your `app.config.js` or `app.json`:

```js
module.exports = {
  // ... other config
  plugins: [
    [
      'react-native-safeguard',
      {
        // Android security config
        securityConfigAndroid: {
          // your Android-specific settings
          ROOT_CHECK_STATE: "ERROR",
          DEVELOPER_OPTIONS_CHECK_STATE: "ERROR",
          MALWARE_CHECK_STATE: "ERROR",
          TAMPERING_CHECK_STATE: "ERROR",
          APP_SPOOFING_CHECK_STATE: "ERROR",
          NETWORK_SECURITY_CHECK_STATE: "WARNING",
          SCREEN_SHARING_CHECK_STATE: "WARNING",
          KEYLOGGER_CHECK_STATE: "ERROR",
          ONGOING_CALL_CHECK_STATE: "WARNING",
          CERTIFICATE_MATCHING_CHECK_STATE: "ERROR",
          EXPECTED_BUNDLE_IDENTIFIER: "com.your.package",
          EXPECTED_SIGNATURE: "",
        },
        // iOS security config - all values must be 'ERROR', 'WARNING', or 'DISABLED'
        securityConfigiOS: {
          ROOT_CHECK_STATE: 'WARNING',
          DEVELOPER_OPTIONS_CHECK_STATE: 'WARNING',
          SIGNATURE_VERIFICATION_CHECK_STATE: 'WARNING',
          NETWORK_SECURITY_CHECK_STATE: 'WARNING',
          SCREEN_SHARING_CHECK_STATE: 'WARNING',
          APP_SPOOFING_CHECK_STATE: 'WARNING',
          KEYLOGGER_CHECK_STATE: 'WARNING',
          ONGOING_CALL_CHECK_STATE: 'WARNING',
          CERTIFICATE_MATCHING_CHECK_STATE: 'WARNING',
          EXPECTED_SIGNATURE: '' // Optional: Your app's expected signature
        }
      }
    ]
  ]
};
```

### Android Setup

1. Add the following to your `android/settings.gradle`:
```groovy
include ':react-native-safeguard'
project(':react-native-safeguard').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-safeguard/android')
```

2. Add the following to your `android/app/build.gradle`:
```groovy
repositories {
    flatDir {
        dirs project(':react-native-safeguard').projectDir.toString() + '/libs'
    }
}
```

### iOS Setup

Run `pod install` in your iOS directory:
```sh
cd ios && pod install
```

## Expo Config Plugin

When using this library in an Expo project, the config plugin will automatically configure both Android and iOS native code during the build process. The plugin supports the following configuration options:

### Android Configuration

Use the `securityConfigAndroid` object to configure Android-specific security settings:

```js
 securityConfigAndroid: {
  // your Android-specific settings
  ROOT_CHECK_STATE: "ERROR",
  DEVELOPER_OPTIONS_CHECK_STATE: "ERROR",
  MALWARE_CHECK_STATE: "ERROR",
  TAMPERING_CHECK_STATE: "ERROR",
  APP_SPOOFING_CHECK_STATE: "ERROR",
  NETWORK_SECURITY_CHECK_STATE: "WARNING",
  SCREEN_SHARING_CHECK_STATE: "WARNING",
  KEYLOGGER_CHECK_STATE: "ERROR",
  ONGOING_CALL_CHECK_STATE: "WARNING",
  CERTIFICATE_MATCHING_CHECK_STATE: "ERROR",
  EXPECTED_BUNDLE_IDENTIFIER: "com.your.package",
  EXPECTED_SIGNATURE: "",
},
```

### iOS Configuration

Use the `securityConfigiOS` object to configure iOS security checks. All values must be one of:
- `'ERROR'` - Fail if the security check fails
- `'WARNING'` - Show a warning if the security check fails
- `'DISABLED'` - Disable this security check

Available configuration options:

```js
securityConfigiOS: {
  ROOT_CHECK_STATE: 'WARNING',                    // Root/Jailbreak detection
  DEVELOPER_OPTIONS_CHECK_STATE: 'WARNING',        // Developer options detection
  SIGNATURE_VERIFICATION_CHECK_STATE: 'WARNING',   // App signature verification
  NETWORK_SECURITY_CHECK_STATE: 'WARNING',        // Network security checks
  SCREEN_SHARING_CHECK_STATE: 'WARNING',          // Screen mirroring detection
  APP_SPOOFING_CHECK_STATE: 'WARNING',           // App spoofing prevention
  KEYLOGGER_CHECK_STATE: 'WARNING',              // Keylogger detection
  ONGOING_CALL_CHECK_STATE: 'WARNING',           // Audio call security
  CERTIFICATE_MATCHING_CHECK_STATE: 'WARNING',    // Certificate validation
  EXPECTED_SIGNATURE: ''                         // Expected app signature
}
```

## Usage

First, initialize the library with your desired security configuration:

```typescript
import Safeguard from 'react-native-safeguard';

// Initialize with custom security levels
Safeguard.initialize({
  rootCheckState: 'ERROR',              // Fail if device is rooted/jailbroken
  developerOptionsCheckState: 'WARNING', // Warn if developer options are enabled
  malwareCheckState: 'WARNING',         // Warn if malware is detected
  tamperingCheckState: 'WARNING',       // Warn if app tampering is detected
  networkSecurityCheckState: 'WARNING', // Warn if network is not secure
  screenSharingCheckState: 'WARNING',   // Warn if screen mirroring is active
  appSpoofingCheckState: 'WARNING',     // Warn if app spoofing is detected
  keyloggerCheckState: 'WARNING',       // Warn if keylogger is detected
  expectedPackageName: 'com.your.app',  // Optional: Verify app package name
  expectedCertificateHash: 'your-hash'  // Optional: Verify app signature
}).catch(error => {
  console.error('Failed to initialize Safeguard:', error);
});
```

Then use the security check methods as needed:

```typescript
// Check all security features
try {
  const result = await Safeguard.checkAll();
  console.log('Security check result:', result);
} catch (error) {
  console.error('Security check failed:', error);
}

// Or check specific features
try {
  const rootStatus = await Safeguard.checkRoot();
  const devOptions = await Safeguard.checkDeveloperOptions();
  const networkSecurity = await Safeguard.checkNetwork();
  const malware = await Safeguard.checkMalware();
  const screenMirroring = await Safeguard.checkScreenMirroring();
  const appSpoofing = await Safeguard.checkApplicationSpoofing();
  const keyLogger = await Safeguard.checkKeyLogger();
  
  console.log('Root Status:', rootStatus);
  // Handle other results...
} catch (error) {
  console.error('Security check failed:', error);
}
```

### Security Check Results

Each security check returns a result object with the following structure:

```typescript
interface SecurityCheckResult {
  status: 'SECURE' | 'WARNING' | 'ERROR';
  message: string;
}
```

## Example

Check out the [example](example) directory for a complete demo application showing how to use all security features.

To run the example app:

```sh
# Clone the repository
git clone https://github.com/your-username/react-native-safeguard.git

# Install dependencies
cd react-native-safeguard
yarn install

# Run the example app
cd example
yarn install
# For iOS
cd ios && pod install && cd ..
yarn ios
# For Android
yarn android
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
