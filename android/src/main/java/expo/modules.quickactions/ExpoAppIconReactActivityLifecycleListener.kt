package expo.modules.quickactions

import android.app.Activity
import android.app.ActivityManager
import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import expo.modules.core.interfaces.ReactActivityLifecycleListener

object SharedObject {
    var packageName: String = ""
    var classesToKill = arrayListOf<String>()
    var icon: String = ""
    var pm: PackageManager? = null
}

class ExpoAppIconReactActivityLifecycleListener : ReactActivityLifecycleListener {

    companion object {
        private const val TAG = "ExpoAppIcon"
        private const val BACKGROUND_CHECK_DELAY = 500L
    }

    private val handler = Handler(Looper.getMainLooper())
    private var isChangingIcon = false
    private var isPaused = false

    override fun onPause(activity: Activity) {
        Log.d(TAG, "onPause triggered for ${activity.localClassName}")
        isPaused = true

        handler.postDelayed({
            if (isPaused && isAppInBackground(activity)) {
                Log.d(TAG, "App is in the background; applying icon change")
                applyIconChange()
            } else {
                Log.d(TAG, "App did not transition to background; skipping icon change")
            }
        }, BACKGROUND_CHECK_DELAY)
    }

    override fun onResume(activity: Activity) {
        Log.d(TAG, "onResume triggered for ${activity.localClassName}")
        isPaused = false
    }

    private fun isAppInBackground(activity: Activity): Boolean {
        val manager = activity.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val runningProcesses = manager.runningAppProcesses ?: return false
        val importanceLevel = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            ActivityManager.RunningAppProcessInfo.IMPORTANCE_CACHED
        } else {
            ActivityManager.RunningAppProcessInfo.IMPORTANCE_BACKGROUND
        }
        return runningProcesses.any {
            it.processName == activity.packageName && it.importance >= importanceLevel
        }
    }

    private fun applyIconChange() {
        if (isChangingIcon) {
            Log.d(TAG, "Icon change already in progress; skipping")
            return
        }
        isChangingIcon = true

        val currentIcon = SharedObject.icon
        if (currentIcon.isEmpty()) {
            isChangingIcon = false
            return
        }

        val pm = SharedObject.pm ?: run {
            Log.e(TAG, "PackageManager is null; cannot change icon.")
            isChangingIcon = false
            return
        }
        val newComponent = ComponentName(SharedObject.packageName, currentIcon)
        if (!doesComponentExist(newComponent, pm)) {
            Log.e(TAG, "Component not found in the manifest: $currentIcon. Skipping icon change.")
            isChangingIcon = false
            return
        }

        SharedObject.classesToKill.forEach { componentName ->
            if (componentName != currentIcon) {
                try {
                    pm.setComponentEnabledSetting(
                        ComponentName(SharedObject.packageName, componentName),
                        PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                        PackageManager.DONT_KILL_APP
                    )
                } catch (e: Exception) {
                    Log.e(TAG, "Error disabling component: $componentName", e)
                }
            }
        }
        SharedObject.classesToKill.clear()

        try {
            pm.setComponentEnabledSetting(
                newComponent,
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            )
            Log.d(TAG, "Successfully changed app icon to: $currentIcon")
        } catch (e: Exception) {
            Log.e(TAG, "Error enabling component: $currentIcon", e)
        } finally {
            isChangingIcon = false
        }
    }

    private fun doesComponentExist(component: ComponentName, pm: PackageManager): Boolean {
        return try {
            val packageInfo = pm.getPackageInfo(
                SharedObject.packageName,
                PackageManager.GET_ACTIVITIES or PackageManager.GET_DISABLED_COMPONENTS
            )
            packageInfo.activities?.any { it.name == component.className } == true
        } catch (e: Exception) {
            Log.e(TAG, "Error checking component existence", e)
            false
        }
    }
}
