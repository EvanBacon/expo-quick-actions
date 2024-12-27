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
    var classesToKill = ArrayList<String>()
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
                Log.d(TAG, "App is in the background; applying icon change Hi!!!!")
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
        val activityManager = activity.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val runningAppProcesses = activityManager.runningAppProcesses

        runningAppProcesses?.forEach {
            Log.d(TAG, "Process name: ${it.processName}, Importance: ${it.importance}")
        }

        // Get the correct importance level for "background" based on the API level
        val backgroundImportance = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            ActivityManager.RunningAppProcessInfo.IMPORTANCE_CACHED
        } else {
            ActivityManager.RunningAppProcessInfo.IMPORTANCE_BACKGROUND
        }

        val isProcessInBackground = runningAppProcesses?.any { process ->
            process.processName == activity.packageName &&
                    process.importance >= backgroundImportance
        } ?: false

        Log.d(TAG, "isProcessInBackground: $isProcessInBackground")
        return isProcessInBackground
    }


    private fun applyIconChange() {
        Log.d(TAG, "Attempting to change the app icon")
        if (isChangingIcon) {
            Log.d(TAG, "Icon change already in progress; skipping")
            return
        }

        isChangingIcon = true

        SharedObject.icon.takeIf { it.isNotEmpty() }?.let { icon ->
            val newComponent = ComponentName(SharedObject.packageName, icon)

            // Check if the new component exists in the manifest
            if (!doesComponentExist(newComponent)) {
                Log.e(TAG, "Component not found in the manifest: $icon. Skipping icon change.")
                isChangingIcon = false
                return
            }

            // Proceed to disable other components if the new component exists
            SharedObject.classesToKill.forEach { cls ->
                if (cls != icon) {
                    try {
                        Log.d(TAG, "Disabling component: $cls")
                        SharedObject.pm?.setComponentEnabledSetting(
                            ComponentName(SharedObject.packageName, cls),
                            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                            PackageManager.DONT_KILL_APP
                        )
                    } catch (e: Exception) {
                        Log.e(TAG, "Error disabling component: $cls", e)
                    }
                }
            }

            SharedObject.classesToKill.clear()

            // Enable the new component
            try {
                Log.d(TAG, "Enabling new component: $icon")
                SharedObject.pm?.setComponentEnabledSetting(
                    newComponent,
                    PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                    PackageManager.DONT_KILL_APP
                )
                Log.d(TAG, "Successfully changed app icon to: $icon")
            } catch (e: Exception) {
                Log.e(TAG, "Error enabling component: $icon", e)
            } finally {
                isChangingIcon = false
            }
        }
    }

    /**
     * Check if a component exists in the manifest (including disabled ones).
     */
    private fun doesComponentExist(componentName: ComponentName): Boolean {
        return try {
            val packageInfo = SharedObject.pm?.getPackageInfo(
                SharedObject.packageName,
                PackageManager.GET_ACTIVITIES or PackageManager.GET_DISABLED_COMPONENTS
            )

            val activityExists = packageInfo?.activities?.any { it.name == componentName.className } == true
            Log.d(TAG, "Component exists: ${componentName.className} -> $activityExists")
            activityExists
        } catch (e: Exception) {
            Log.e(TAG, "Error checking component existence", e)
            false
        }
    }

}
