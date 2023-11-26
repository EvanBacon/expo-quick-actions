package expo.modules.quickactions

import android.app.Activity
import android.content.Context
import android.os.Bundle
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class QuickActionsReactActivityLifecycleListener(activityContext: Context) : ReactActivityLifecycleListener {

    override fun onCreate(activity: Activity?, savedInstanceState: Bundle?) {
//        android.os.Debug.waitForDebugger()

        super.onCreate(activity, savedInstanceState)

        activity?.intent?.let {
            QuickActionsSingleton.launchAction = ExpoQuickActionsModule.convertShortcutIntent(it)
        }
    }
}
