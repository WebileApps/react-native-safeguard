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
        'react-native-safeguard/withSafeguard',
        {
          // Android security configuration
          securityConfigAndroid: {
            ROOT_CHECK: 'WARNING',
            DEVELOPER_OPTIONS_CHECK: 'WARNING',
            SIGNATURE_CHECK: 'WARNING',
            NETWORK_SECURITY_CHECK: 'WARNING',
            SCREEN_SHARING_CHECK: 'WARNING',
            APP_SPOOFING_CHECK: 'WARNING',
            KEYLOGGER_CHECK: 'WARNING',
            ONGOING_CALL_CHECK: 'WARNING',
          },
          // iOS security configuration
          securityConfigiOS: {
            ROOT_CHECK_STATE: 'ERROR',
            DEVELOPER_OPTIONS_CHECK_STATE: 'WARNING',
            SIGNATURE_VERIFICATION_CHECK_STATE: 'WARNING',
            NETWORK_SECURITY_CHECK_STATE: 'WARNING',
            SCREEN_SHARING_CHECK_STATE: 'WARNING',
            APP_SPOOFING_CHECK_STATE: 'WARNING',
            KEYLOGGER_CHECK_STATE: 'WARNING',
            ONGOING_CALL_CHECK_STATE: 'WARNING',
            CERTIFICATE_MATCHING_CHECK_STATE: 'WARNING',
            EXPECTED_BUNDLE_IDENTIFIER: 'com.shobhit.t.security-checker-demo',
            EXPECTED_SIGNATURE: '', // Add your app's signature if needed
          },
        },
      ],
    ],
  },
};
