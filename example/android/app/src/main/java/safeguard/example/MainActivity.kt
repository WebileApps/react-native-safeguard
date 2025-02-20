package safeguard.example

import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.safeguard.SafeguardReactActivity

class MainActivity : SafeguardReactActivity() {

  override var securityConfigMap: Map<String, String> =
      mapOf(
        "ROOT_CHECK_STATE" to "DISABLED",
        "DEVELOPER_OPTIONS_CHECK_STATE" to "DISABLED",
        "CERTIFICATE_MATCHING_CHECK_STATE" to "WARNING",
        "EXPECTED_SIGNATURE" to "FAC61745DC0903786FB9EDE62A962B399F7348F0BB6F899B8332667591033B9C"
        )
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "SafeguardExample"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
