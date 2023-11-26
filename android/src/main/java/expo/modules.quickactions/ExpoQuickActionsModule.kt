package expo.modules.quickactions

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.content.res.Resources
import android.graphics.drawable.Icon
import android.os.Build
import android.os.Bundle
import android.os.Parcelable
import android.os.PersistableBundle
import androidx.annotation.RequiresApi
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class ActionObject(id: String, title: String, subtitle: String?, icon: String?, params: Map<String, Any>?) : Record {
    @Field
    val id: String = id
    @Field
    val title: String = title

    @Field
    val subtitle: String? = subtitle

    @Field
    val icon: String? = icon

    @Field
    val params: Map<String, Any>? = params

    companion object {
        fun fromBundle(bundle: Bundle): ActionObject {
            val id = bundle.getString("id", "")
            val title = bundle.getString("title", "")
            val subtitle = bundle.getString("subtitle")
            val icon = bundle.getString("icon")
            val paramsBundle = bundle.getBundle("params")
            val params = paramsBundle?.let { bundleToMap(it) }

            return ActionObject(id, title, subtitle, icon, params)
        }

        fun fromPersistableBundle(bundle: PersistableBundle): ActionObject {
            val id = bundle.getString("id", "")
            val title = bundle.getString("title", "")
            val subtitle = bundle.getString("subtitle")
            val icon = bundle.getString("icon")
            // For PersistableBundle, params might need to be handled differently
            // as it does not support all types that Bundle does.
            val paramsBundle = bundle.getPersistableBundle("params")
            val params = paramsBundle?.let { extractUserInfoFromPersistableBundle(it) }

            return ActionObject(id, title, subtitle, icon, params)
        }

         private fun extractUserInfoFromPersistableBundle(bundle: PersistableBundle): Map<String, Any>? {
            val paramsMap = mutableMapOf<String, Any>()
            bundle.keySet().forEach { key ->
                when (val value = bundle.get(key)) {
                    is Int, is Long, is Double, is String, is Boolean -> paramsMap[key] = value
                    // Add other types as needed, e.g., arrays of basic types
                    // Note: PersistableBundle does not support all types that Bundle does
                }
            }
            return if (paramsMap.isNotEmpty()) paramsMap else null
        }
    
    }

    fun toBundle(): Bundle {
        val bundle = Bundle()
        bundle.putString("id", id)
        bundle.putString("title", title)
        bundle.putString("subtitle", subtitle)
        bundle.putString("icon", icon)
        params?.let { paramsMap ->
            val paramsBundle = mapToBundle(paramsMap)
            bundle.putBundle("params", paramsBundle)
        }
        return bundle
    }
}

fun mapToBundle(map: Map<String, Any>?): Bundle {
    val bundle = Bundle()
    map?.forEach { (key, value) ->
        when (value) {
            is Int -> bundle.putInt(key, value)
            is Long -> bundle.putLong(key, value)
            is CharSequence -> bundle.putCharSequence(key, value)
            is String -> bundle.putString(key, value)
            is Float -> bundle.putFloat(key, value)
            is Double -> bundle.putDouble(key, value)
            is Boolean -> bundle.putBoolean(key, value)
            is Bundle -> bundle.putBundle(key, value)
            is Parcelable -> bundle.putParcelable(key, value)
            is java.io.Serializable -> bundle.putSerializable(key, value)
            else -> throw IllegalArgumentException("Unsupported bundle component (${value.javaClass})")
        }
    }
    return bundle
}

fun bundleToMap(bundle: Bundle?): Map<String, Any> {
    val map = mutableMapOf<String, Any>()
    bundle?.keySet()?.forEach { key ->
        bundle.get(key)?.let { value ->
            map[key] = value
        }
    }
    return map
}

// Intent ID -- this should never change.
val UNIQ_ACTION_ID = "expo.modules.quickactions.SHORTCUT"

class ExpoQuickActionsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val currentActivity: Activity?
    get() = appContext.currentActivity

    companion object {
        private var instance: ExpoQuickActionsModule? = null

        private fun notifyShortcutAction(action: ActionObject) {
            // Send an event with the shortcutId or relevant information
            instance?.sendEvent("onQuickAction", mapOf("id" to action.id, "title" to action.title, "subtitle" to action.subtitle, "icon" to action.icon, "params" to action.params))
        }

        fun convertShortcutIntent(intent: Intent): ActionObject? {
            // Check if the intent comes from a shortcut action
            if (intent.action == UNIQ_ACTION_ID) {
                // Extract information from the intent to identify the shortcut action

                val actionBundle = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    intent.getParcelableExtra("shortcut_data")
                } else {
                    intent.getBundleExtra("shortcut_data") as PersistableBundle?
                }

                if (actionBundle != null) {
                    val actionObject = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && actionBundle is PersistableBundle) {
                        return ActionObject.fromPersistableBundle(actionBundle)
                    } else {
                        return ActionObject.fromBundle(actionBundle as Bundle)
                    }
                }
            }
            return null;
        }

        fun handleShortcutIntent(intent: Intent) {
            // Check if the intent comes from a shortcut action
            if (intent.action == UNIQ_ACTION_ID) {
                // Extract information from the intent to identify the shortcut action

                val actionBundle = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    intent.getParcelableExtra("shortcut_data")
                } else {
                    intent.getBundleExtra("shortcut_data") as PersistableBundle?
                }

                actionBundle?.let {
                    val actionObject = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && it is PersistableBundle) {
                        ActionObject.fromPersistableBundle(it)
                    } else {
                        ActionObject.fromBundle(it as Bundle)
                    }
                    notifyShortcutAction(actionObject)

                }
            }
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoQuickActions")

        AsyncFunction("setItems") { items: List<ActionObject> ->
          setItems(items)
        }

        Constants {
            return@Constants mapOf(
                    "maxCount" to QuickActionsSingleton.maxCount,
                    "initial" to QuickActionsSingleton.launchAction?.let {
                mapOf("id" to it.id, "title" to it.title, "subtitle" to it.subtitle, "icon" to it.icon, "params" to it.params)
            })
        }

        AsyncFunction("isSupported") {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
                isSupported(context)
            } else {
                false
            }
        }

        OnNewIntent {
            handleShortcutIntent(it)
        }

        OnCreate {
            instance = this@ExpoQuickActionsModule
        }

        OnDestroy {
            instance = null
        }

        Events("onQuickAction")
    }

    private fun setItems(items: List<ActionObject>) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
            setShortcuts(items)
        }
    }

    @RequiresApi(Build.VERSION_CODES.N_MR1)
    private fun setShortcuts(items: List<ActionObject>) {
        val shortcutManager = context.getSystemService(Context.SHORTCUT_SERVICE) as ShortcutManager

        val shortcuts = items.mapNotNull {
            val intent = Intent(context, currentActivity!!::class.java)
            intent.action = UNIQ_ACTION_ID
            intent.putExtra("shortcut_data", it.toBundle());
            val builder = ShortcutInfo.Builder(context, it.id)
                    .setShortLabel(it.title)
                    .setLongLabel(it.title)

            val iconRes = loadIconRes(it.icon)
            if (iconRes > 0) {
                builder.setIcon(Icon.createWithResource(context, iconRes))
            }

            builder.setIntent(intent)
                .build()
        }
        shortcutManager.dynamicShortcuts = shortcuts
    }

    private fun loadIconRes(icon: String?): Int {
        if (icon == null) {
            return 0
        }
        val packageName = context.packageName
        val res: Resources = context.resources
        val resourceId: Int = res.getIdentifier(icon, "drawable", packageName)
        return if (resourceId == 0) {
            res.getIdentifier(icon, "mipmap", packageName)
        } else {
            resourceId
        }
    }

    @RequiresApi(Build.VERSION_CODES.N_MR1)
    private fun isSupported(context: Context): Boolean {
        val shortcutManager = context.getSystemService(Context.SHORTCUT_SERVICE) as ShortcutManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            shortcutManager.isRequestPinShortcutSupported
        } else {
            true
        }
    }
}
