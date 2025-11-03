package com.safeguard

import androidx.activity.ComponentActivity
import com.facebook.react.bridge.*
import com.webileapps.safeguard.SecurityChecker
import com.webileapps.safeguard.SecurityConfigManager
import com.webileapps.safeguard.IntegrityTokenListener
import android.os.Handler
import android.os.Looper

class SafeguardModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

  private lateinit var securityChecker: SecurityChecker

  init {
    reactContext.addLifecycleEventListener(this)
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun initialize(config: ReadableMap, promise: Promise) {
    try {
      val securityConfig = SecurityChecker.SecurityConfig(
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("rootCheckState") ?: "ERROR"
        ),
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("developerOptionsCheckState") ?: "WARNING"
        ),
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("malwareCheckState") ?: "WARNING"
        ),
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("tamperingCheckState") ?: "WARNING"
        ),
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("networkSecurityCheckState") ?: "WARNING"
        ),
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("screenSharingCheckState") ?: "WARNING"
        ),
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("appSpoofingCheckState") ?: "WARNING"
        ),
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("keyloggerCheckState") ?: "WARNING"
        ),
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("ongoingCallCheckState") ?: "WARNING"
        ),
        SecurityChecker.SecurityCheckState.fromString(
          config.getString("certificateMatchingCheckState") ?: "WARNING"
        ),
        config.getString("expectedPackageName") ?: reactContext.packageName,
        config.getString("expectedCertificateHash") ?: ""
      )

      SecurityConfigManager.initialize(reactContext, securityConfig)
      securityChecker = SecurityConfigManager.getSecurityChecker()

//      Handler(Looper.getMainLooper()).postDelayed({
//        securityChecker.runSecurityChecks()
//      }, 0)

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

  @ReactMethod
  fun getAndroidIntegrityToken(promise: Promise) {
    try {
      if (!::securityChecker.isInitialized) {
        throw Exception("SecurityChecker not initialized. Call initialize() first.")
      }
      securityChecker.deviceIntegrity(object : IntegrityTokenListener {

        override fun onIntegrityTokenSuccess(token: String, nonce: String) {
          promise.resolve(token)
        }

        override fun onIntegrityTokenFailure(exception: Exception) {
          promise.reject("ERROR", exception.message)
        }
      })
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  override fun onHostResume() {
    // Check if securityChecker is initialized before running security checks
    if (::securityChecker.isInitialized) {
          securityChecker.runSecurityChecks()
    } else {
        // Optionally log or handle the case when securityChecker is not initialized
    }
  }

  override fun onHostPause() {
    // Optionally handle pause events
  }

  override fun onHostDestroy() {
    // Remove the listener to avoid memory leaks
    reactContext.removeLifecycleEventListener(this)
  }

  companion object {
    const val NAME = "Safeguard"
  }
}
