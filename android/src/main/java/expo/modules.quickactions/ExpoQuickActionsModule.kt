package expo.modules.quickactions

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import androidx.annotation.RequiresApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class ActionObject : Record {
    @Field
    val id: String = ""
    @Field
    val title: String = ""

    @Field
    val subtitle: String? = null

    @Field
    val icon: String? = null

    @Field
    val userInfo: Map<String, Any>? = null
}

class ExpoQuickActionsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val currentActivity: Activity?
    get() = appContext.currentActivity

    companion object {
        private var instance: ExpoQuickActionsModule? = null

        fun notifyShortcutAction(shortcutId: String?) {
            // Send an event with the shortcutId or relevant information
            instance?.sendEvent("onQuickAction", mapOf("id" to shortcutId))
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
            intent.putExtra("shortcutId", it.id)
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
