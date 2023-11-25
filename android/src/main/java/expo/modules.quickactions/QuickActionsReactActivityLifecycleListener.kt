package expo.modules.quickactions

import android.content.Context
import android.content.Intent
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
      val shortcutId = intent.getStringExtra("shortcutId") // Customize as needed
      // Notify the module about the shortcut action
      ExpoQuickActionsModule.notifyShortcutAction(shortcutId)
    }
  }
}
