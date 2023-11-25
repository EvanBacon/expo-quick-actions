package expo.modules.quickactions

import android.content.Context
import expo.modules.core.ExportedModule
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class QuickActionsPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
    return listOf(QuickActionsReactActivityLifecycleListener(activityContext))
  }
}
