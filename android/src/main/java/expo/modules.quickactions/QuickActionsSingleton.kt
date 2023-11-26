package expo.modules.quickactions

import expo.modules.core.interfaces.SingletonModule

object QuickActionsSingleton : SingletonModule {

  override fun getName(): String {
    return "QuickActions"
  }

    // member to store the initial launch intent
    var launchAction: ActionObject? = null
}
