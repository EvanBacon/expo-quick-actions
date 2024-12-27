package expo.modules.quickactions

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoAppIconModule : Module() {
    companion object {
        private const val TAG = "ExpoAppIcon"
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoAppIcon")

        Function("setIcon") { name: String? ->
      try {
        if (name == null) {
          // Reset to default icon
          var currentIcon = if (!SharedObject.icon.isEmpty()) SharedObject.icon else context.packageName + ".MainActivity"

          // Disable the current icon alias if it's set
            packageManager.setComponentEnabledSetting(
            ComponentName(context.packageName, currentIcon),
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
          )

          // Enable the default icon alias (MainActivity)
            packageManager.setComponentEnabledSetting(
            ComponentName(context.packageName, context.packageName + ".MainActivity"),
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
          )

          // Reset SharedObject icon to default
          SharedObject.icon = ""

          return@Function "DEFAULT" // Return a string indicating default icon
        } else {
          // Set the new app icon
          // Append the static "expo_ic_" prefix to the icon name
          var newIcon: String = context.packageName + ".MainActivity" + "expo_ic_" + name
          var currentIcon: String = if (!SharedObject.icon.isEmpty()) SharedObject.icon else context.packageName + ".MainActivity"

          SharedObject.packageName = context.packageName
          SharedObject.pm = packageManager

          // Enable the new icon alias
            packageManager.setComponentEnabledSetting(
            ComponentName(context.packageName, newIcon),
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            PackageManager.DONT_KILL_APP
          )

          // Disable the current icon alias
          packageManager.setComponentEnabledSetting(
            ComponentName(context.packageName, currentIcon),
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
          )

          // Update the icon in SharedObject
          SharedObject.classesToKill.add(currentIcon)
          SharedObject.icon = newIcon

          return@Function name
        }
      } catch (e: Exception) {
        return@Function false
      }
    }

        AsyncFunction("getIcon") {
            val currentIcon = getCurrentIcon()
            val iconName = currentIcon.split("MainActivity").getOrNull(1) ?: "Default"
            return@AsyncFunction iconName
        }
    }

    private val context: Context
        get() = requireNotNull(appContext.reactContext) { "React Application Context is null" }

    private val packageManager: PackageManager
        get() = requireNotNull(context.packageManager) { "Package Manager is null" }

    private fun getCurrentIcon(): String {
        return try {
            val activities = packageManager.getPackageInfo(
                context.packageName,
                PackageManager.GET_ACTIVITIES
            ).activities

            activities?.firstOrNull {
                packageManager.getComponentEnabledSetting(
                    ComponentName(context.packageName, it.name)
                ) == PackageManager.COMPONENT_ENABLED_STATE_ENABLED
            }?.name ?: "${context.packageName}.MainActivity"
        } catch (e: Exception) {
            Log.e(TAG, "Error getting current icon", e)
            "${context.packageName}.MainActivity"
        }
    }
}
