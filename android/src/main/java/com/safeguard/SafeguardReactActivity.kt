package com.safeguard

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.*
import com.webileapps.safeguard.SecurityChecker
import com.webileapps.safeguard.SecurityConfigManager

open class SafeguardReactActivity : ReactActivity() {

    open val securityConfigMap = mapOf<String, String>();
    private lateinit var securityChecker: SecurityChecker

  override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    /**
     *  this.rootCheck = rootCheck;
     *  this.developerOptionsCheck = developerOptionsCheck;
     *  this.malwareCheck = malwareCheck;
     *  this.tamperingCheck = tamperingCheck;
     *  this.appSpoofingCheck = appSpoofingCheck;
     *  this.networkSecurityCheck = networkSecurityCheck;
     *  this.screenSharingCheck = screenSharingCheck;
     *  this.keyloggerCheck = keyloggerCheck;
     *  this.appSignature = appSignature;
     *  this.ongoingCallCheck = ongoingCallCheck;
     *  this.expectedPackageName = expectedPackageName;
     *  this.expectedSignature = expectedSignature;
     */
    val securityConfig = SecurityChecker.SecurityConfig(
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["ROOT_CHECK_STATE"] ?: "DISABLED"),
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["DEVELOPER_OPTIONS_CHECK_STATE"] ?: "DISABLED"),
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["MALWARE_CHECK_STATE"] ?: "WARNING"),
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["TAMPERING_CHECK_STATE"] ?: "WARNING"),
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["APP_SPOOFING_CHECK_STATE"] ?: "WARNING"),
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["NETWORK_SECURITY_CHECK_STATE"] ?: "WARNING"),
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["SCREEN_SHARING_CHECK_STATE"] ?: "WARNING"),
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["KEYLOGGER_CHECK_STATE"] ?: "WARNING"),
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["CERTIFICATE_MATCHING_CHECK_STATE"] ?: "WARNING"),
      SecurityChecker.SecurityCheckState.fromString(securityConfigMap["ONGOING_CALL_CHECK_STATE"] ?: "DISABLED"),
      securityConfigMap["EXPECTED_PACKAGE_NAME"] ?: "safeguard.example",
      securityConfigMap["EXPECTED_SIGNATURE"] ?: "FAC61745DC0903786FB9EDE62A962B399F7348F0BB6F899B8332667591033B9C"
    )
    SecurityConfigManager.initialize(this, securityConfig)
    securityChecker = SecurityConfigManager.getSecurityChecker()
    securityChecker.runSecurityChecks()
    }

  override fun onResume() {
    super.onResume()
    securityChecker.runSecurityChecks()
  }
}
