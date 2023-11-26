package expo.modules.quickactions

import android.app.Activity
import android.content.Context
import android.content.pm.ShortcutManager
import android.os.Build
import android.os.Bundle
import expo.modules.core.interfaces.ReactActivityLifecycleListener


class QuickActionsReactActivityLifecycleListener(activityContext: Context) : ReactActivityLifecycleListener {

    override fun onCreate(activity: Activity?, savedInstanceState: Bundle?) {
//        android.os.Debug.waitForDebugger()

        super.onCreate(activity, savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
            activity?.applicationContext?.let {
                val service = it.getSystemService(Context.SHORTCUT_SERVICE) as ShortcutManager
                QuickActionsSingleton.maxCount = service.maxShortcutCountPerActivity
            }
            activity?.intent?.let {
                QuickActionsSingleton.launchAction = ExpoQuickActionsModule.convertShortcutIntent(it)
            }
        }
    }
}
