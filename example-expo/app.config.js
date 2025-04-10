module.exports = {
  expo: {
    name: 'security-checker-demo',
    slug: 'security-checker-demo',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shobhit.t.security-checker-demo',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.shobhit.t.security_checker_demo',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'react-native-safeguard',
        {
          // Android security configuration
          securityConfigAndroid: {
            ROOT_CHECK_STATE: 'DISABLED',
            DEVELOPER_OPTIONS_CHECK_STATE: 'WARNING',
            SIGNATURE_CHECK_STATE: 'WARNING',
            NETWORK_SECURITY_CHECK_STATE: 'WARNING',
            SCREEN_SHARING_CHECK_STATE: 'WARNING',
            APP_SPOOFING_CHECK_STATE: 'DISABLED',
            KEYLOGGER_CHECK_STATE: 'WARNING',
            ONGOING_CALL_CHECK_STATE: 'WARNING',
          },
          // iOS security configuration
          securityConfigiOS: {
            ROOT_CHECK_STATE: 'WARNING',
            DEVELOPER_OPTIONS_CHECK_STATE: 'DISABLED',
            SIGNATURE_VERIFICATION_CHECK_STATE: 'DISABLED',
            SIGNATURE_ERROR_DEBUG: true,
            NETWORK_SECURITY_CHECK_STATE: 'WARNING',
            SCREEN_SHARING_CHECK_STATE: 'WARNING',
            APP_SPOOFING_CHECK_STATE: 'DISABLED',
            KEYLOGGER_CHECK_STATE: 'WARNING',
            ONGOING_CALL_CHECK_STATE: 'WARNING',
            CERTIFICATE_MATCHING_CHECK_STATE: 'DISABLED',
            EXPECTED_BUNDLE_IDENTIFIER: 'com.shobhit.t.security-checker-demo',
            EXPECTED_SIGNATURE: '', // Add your app's signature if needed
          },
        },
      ],
    ],
  },
};
