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
    private const val MAIN_ACTIVITY_ALIAS = ".MainActivity"
    private const val ICON_PREFIX = "expo_ic_"
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoAppIcon")

    Function("setIcon") { iconName: String? ->
      val mainActivityAlias = context.packageName + MAIN_ACTIVITY_ALIAS
      val currentIcon = if (SharedObject.icon.isNotEmpty()) SharedObject.icon else mainActivityAlias

      try {
      if (iconName == null) {
        disableIcon(currentIcon)
        enableIcon(mainActivityAlias)
        SharedObject.icon = ""
        return@Function null
      } else {
        val newIcon = mainActivityAlias + ICON_PREFIX + iconName
        SharedObject.packageName = context.packageName
        SharedObject.pm = packageManager

        enableIcon(newIcon)
        disableIcon(currentIcon)
        SharedObject.classesToKill.add(currentIcon)
        SharedObject.icon = newIcon

        return@Function iconName
      }
      } catch (e: Exception) {
      return@Function false
      }
    }

    AsyncFunction("getIcon") {
      val currentIcon = findEnabledAlias() ?: (context.packageName + MAIN_ACTIVITY_ALIAS)
      val iconSuffix = currentIcon.substringAfter(MAIN_ACTIVITY_ALIAS, "Default")
      return@AsyncFunction if (iconSuffix.isBlank()) "Default" else iconSuffix.removePrefix(ICON_PREFIX)
    }
  }

  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React Application Context is null" }

  private val packageManager: PackageManager
    get() = requireNotNull(context.packageManager) { "Package Manager is null" }

  private fun enableIcon(alias: String) {
    packageManager.setComponentEnabledSetting(
      ComponentName(context.packageName, alias),
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
      PackageManager.DONT_KILL_APP
    )
  }

  private fun disableIcon(alias: String) {
    packageManager.setComponentEnabledSetting(
      ComponentName(context.packageName, alias),
      PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
      PackageManager.DONT_KILL_APP
    )
  }

  private fun findEnabledAlias(): String? {
    return try {
      val activities = packageManager.getPackageInfo(context.packageName, PackageManager.GET_ACTIVITIES).activities
      activities?.firstOrNull {
        packageManager.getComponentEnabledSetting(
          ComponentName(context.packageName, it.name)
        ) == PackageManager.COMPONENT_ENABLED_STATE_ENABLED
      }?.name
    } catch (e: Exception) {
      Log.e(TAG, "Error getting current icon", e)
      null
    }
  }
}
