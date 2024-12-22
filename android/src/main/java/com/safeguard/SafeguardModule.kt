package com.safeguard

import androidx.activity.ComponentActivity
import com.facebook.react.bridge.*
import com.webileapps.safeguard.SecurityChecker
import com.webileapps.safeguard.SecurityConfigManager

class SafeguardModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private lateinit var securityChecker: SecurityChecker

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun initialize(config: ReadableMap, promise: Promise) {
    try {
      val securityConfig = SecurityChecker.SecurityConfig(
        rootCheck = SecurityChecker.SecurityCheckState.fromString(
          config.getString("rootCheckState") ?: "ERROR"
        ),
        developerOptionsCheck = SecurityChecker.SecurityCheckState.fromString(
          config.getString("developerOptionsCheckState") ?: "WARNING"
        ),
        malwareCheck = SecurityChecker.SecurityCheckState.fromString(
          config.getString("malwareCheckState") ?: "WARNING"
        ),
        tamperingCheck = SecurityChecker.SecurityCheckState.fromString(
          config.getString("tamperingCheckState") ?: "WARNING"
        ),
        networkSecurityCheck = SecurityChecker.SecurityCheckState.fromString(
          config.getString("networkSecurityCheckState") ?: "WARNING"
        ),
        screenSharingCheck = SecurityChecker.SecurityCheckState.fromString(
          config.getString("screenSharingCheckState") ?: "WARNING"
        ),
        appSpoofingCheck = SecurityChecker.SecurityCheckState.fromString(
          config.getString("appSpoofingCheckState") ?: "WARNING"
        ),
        keyloggerCheck = SecurityChecker.SecurityCheckState.fromString(
          config.getString("keyloggerCheckState") ?: "WARNING"
        ),
        appSignature = SecurityChecker.SecurityCheckState.fromString(
          config.getString("certificateMatchingCheckState") ?: "WARNING"
        ),
        ongoingCallCheck = SecurityChecker.SecurityCheckState.fromString(
          config.getString("ongoingCallCheckState") ?: "WARNING"
        ),
        expectedPackageName = config.getString("expectedPackageName") ?: reactContext.packageName,
        expectedSignature = config.getString("expectedCertificateHash") ?: ""
      )

      SecurityConfigManager.initialize(reactContext, securityConfig)
      securityChecker = SecurityConfigManager.getSecurityChecker()

      // Setup call monitoring if available
//      currentActivity?.let { activity ->
//        securityChecker.setupCallMonitoring(activity as ComponentActivity) { null }
//      }

      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("INIT_ERROR", e.message)
    }
  }

  @ReactMethod
  fun checkAll(promise: Promise) {
    try {
      if (!::securityChecker.isInitialized) {
        throw Exception("SecurityChecker not initialized. Call initialize() first.")
      }
      val result = securityChecker.runSecurityChecks()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @ReactMethod
  fun checkRoot(promise: Promise) {
    try {
      if (!::securityChecker.isInitialized) {
        throw Exception("SecurityChecker not initialized. Call initialize() first.")
      }
      val result = securityChecker.checkRootStatus()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @ReactMethod
  fun checkDeveloperOptions(promise: Promise) {
    try {
      if (!::securityChecker.isInitialized) {
        throw Exception("SecurityChecker not initialized. Call initialize() first.")
      }
      val result = securityChecker.checkDeveloperOptions()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @ReactMethod
  fun checkMalware(promise: Promise) {
    try {
      if (!::securityChecker.isInitialized) {
        throw Exception("SecurityChecker not initialized. Call initialize() first.")
      }
      val result = securityChecker.checkMalwareAndTampering()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @ReactMethod
  fun checkNetwork(promise: Promise) {
    try {
      if (!::securityChecker.isInitialized) {
        throw Exception("SecurityChecker not initialized. Call initialize() first.")
      }
      val result = securityChecker.checkNetworkSecurity()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @ReactMethod
  fun checkScreenMirroring(promise: Promise) {
    try {
      if (!::securityChecker.isInitialized) {
        throw Exception("SecurityChecker not initialized. Call initialize() first.")
      }
      val result = securityChecker.checkScreenMirroring()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @ReactMethod
  fun checkApplicationSpoofing(promise: Promise) {
    try {
      if (!::securityChecker.isInitialized) {
        throw Exception("SecurityChecker not initialized. Call initialize() first.")
      }
      val result = securityChecker.checkAppSpoofing()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @ReactMethod
  fun checkKeyLogger(promise: Promise) {
    try {
      if (!::securityChecker.isInitialized) {
        throw Exception("SecurityChecker not initialized. Call initialize() first.")
      }
      val result = securityChecker.checkKeyLoggerDetection()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  companion object {
    const val NAME = "Safeguard"
  }
}
