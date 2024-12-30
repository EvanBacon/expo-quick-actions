package expo.modules.quickactions

import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class AppIconPackage : Package {
    override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
        return listOf(ExpoAppIconReactActivityLifecycleListener())
    }
}
