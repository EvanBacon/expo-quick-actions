package expo.modules.quickactions

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import android.os.Bundle
import android.os.Parcelable
import android.os.PersistableBundle
import androidx.annotation.RequiresApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class ActionObject(id: String, title: String, subtitle: String?, icon: String?, userInfo: Map<String, Any>?) : Record {
    @Field
    val id: String = id
    @Field
    val title: String = title

    @Field
    val subtitle: String? = subtitle

    @Field
    val icon: String? = icon

    @Field
    val userInfo: Map<String, Any>? = userInfo

    companion object {
        fun fromBundle(bundle: Bundle): ActionObject {
            val id = bundle.getString("id", "")
            val title = bundle.getString("title", "")
            val subtitle = bundle.getString("subtitle")
            val icon = bundle.getString("icon")
            val userInfoBundle = bundle.getBundle("userInfo")
            val userInfo = userInfoBundle?.let { bundleToMap(it) }

            return ActionObject(id, title, subtitle, icon, userInfo)
        }

        fun fromPersistableBundle(bundle: PersistableBundle): ActionObject {
            val id = bundle.getString("id", "")
            val title = bundle.getString("title", "")
            val subtitle = bundle.getString("subtitle")
            val icon = bundle.getString("icon")
            // For PersistableBundle, userInfo might need to be handled differently
            // as it does not support all types that Bundle does.
            val userInfoBundle = bundle.getPersistableBundle("userInfo")
            val userInfo = userInfoBundle?.let { extractUserInfoFromPersistableBundle(it) }

            return ActionObject(id, title, subtitle, icon, userInfo)
        }

         private fun extractUserInfoFromPersistableBundle(bundle: PersistableBundle): Map<String, Any>? {
            val userInfoMap = mutableMapOf<String, Any>()
            bundle.keySet().forEach { key ->
                when (val value = bundle.get(key)) {
                    is Int, is Long, is Double, is String, is Boolean -> userInfoMap[key] = value
                    // Add other types as needed, e.g., arrays of basic types
                    // Note: PersistableBundle does not support all types that Bundle does
                }
            }
            return if (userInfoMap.isNotEmpty()) userInfoMap else null
        }
    
    }

    fun toBundle(): Bundle {
        val bundle = Bundle()
        bundle.putString("id", id)
        bundle.putString("title", title)
        bundle.putString("subtitle", subtitle)
        bundle.putString("icon", icon)
        userInfo?.let { userInfoMap ->
            val userInfoBundle = mapToBundle(userInfoMap)
            bundle.putBundle("userInfo", userInfoBundle)
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

class ExpoQuickActionsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val currentActivity: Activity?
    get() = appContext.currentActivity

    companion object {
        private var instance: ExpoQuickActionsModule? = null

        fun notifyShortcutAction(action: ActionObject) {
            // Send an event with the shortcutId or relevant information
            instance?.sendEvent("onQuickAction", mapOf("id" to action.id, "title" to action.title, "subtitle" to action.subtitle, "icon" to action.icon, "userInfo" to action.userInfo))
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoQuickActions")

        AsyncFunction("setItems") { items: List<ActionObject> ->
          setItems(items)
        }

        AsyncFunction("isSupported") {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
                isSupported(context)
            } else {
                false
            }
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
            intent.action = Intent.ACTION_VIEW

            intent.putExtra("shortcut_data", it.toBundle());

            // Pass the shortcut information to the intent
//            intent.putExtra("shortcut_user_info", mapToBundle(it.userInfo))
//            intent.putExtra("shortcut_icon", it.icon)
//            intent.putExtra("shortcut_subtitle", it.subtitle)
//            intent.putExtra("shortcut_title", it.title)
//            intent.putExtra("shortcut_id", it.id)
            
            ShortcutInfo.Builder(context, it.id)
                    .setShortLabel(it.title)
                    .setLongLabel(it.subtitle ?: it.title)
                .setIcon(Icon.createWithResource(context, getResourceIdForIcon(it.icon)))
                .setIntent(intent)
                .build()
        }
        shortcutManager.dynamicShortcuts = shortcuts
    }

    private fun getResourceIdForIcon(iconName: String?): Int {
        iconName?.let {
            return context.resources.getIdentifier(it, "drawable", context.packageName)
        }
        return 0 // Default icon resource ID
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
