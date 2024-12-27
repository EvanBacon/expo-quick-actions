package expo.modules.quickactions

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log

object ComponentUtils {
    private const val TAG = "ComponentUtils"

    /**
     * Check if a component exists in the manifest (including disabled ones).
     */
    fun doesComponentExist(context: Context, componentName: String): Boolean {
        return try {
            val packageManager = context.packageManager
            val packageInfo = packageManager.getPackageInfo(
                context.packageName,
                PackageManager.GET_ACTIVITIES or PackageManager.GET_DISABLED_COMPONENTS
            )

            val activityExists = packageInfo.activities.any { it.name == componentName }
            Log.d(TAG, "Component exists: $componentName -> $activityExists")
            activityExists
        } catch (e: Exception) {
            Log.e(TAG, "Error checking component existence for $componentName", e)
            false
        }
    }
}
