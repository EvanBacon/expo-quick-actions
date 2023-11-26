package expo.modules.quickactions

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.PersistableBundle
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class QuickActionsReactActivityLifecycleListener(activityContext: Context) : ReactActivityLifecycleListener {
  override fun onNewIntent(intent: Intent?): Boolean {
    if (intent != null) {
      handleShortcutIntent(intent)
    }
    return super.onNewIntent(intent)
  }

  private fun handleShortcutIntent(intent: Intent) {
    // Check if the intent comes from a shortcut action
    if (intent.action == Intent.ACTION_VIEW) {
      // Extract information from the intent to identify the shortcut action

    val actionBundle = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        intent.getParcelableExtra<PersistableBundle>("shortcut_data")
    } else {
        intent.getBundleExtra("shortcut_data") as PersistableBundle?
    }

    actionBundle?.let {
        val actionObject = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && it is PersistableBundle) {
            ActionObject.fromPersistableBundle(it)
        } else {
            ActionObject.fromBundle(it as Bundle)
        }
        // Use actionObject as needed

                ExpoQuickActionsModule.notifyShortcutAction(actionObject)

    }
    }
  }
}

fun bundleToMap(bundle: Bundle?): Map<String, Any> {
  val map = mutableMapOf<String, Any>()
  bundle?.keySet()?.forEach { key ->
    bundle.get(key)?.let { value ->
      map[key] = value
    }
  }
  return map
}
