package expo.modules.quickactions

import expo.modules.core.interfaces.SingletonModule

object QuickActionsSingleton : SingletonModule {

  override fun getName(): String {
    return "QuickActions"
  }

    // member to store the initial launch intent
    var launchAction: ActionObject? = null
    var maxCount: Number? = null
    // latest action received while JS was not observing; emitted once observing starts
    var pendingAction: ActionObject? = null
    @Volatile var isObserving: Boolean = false

}
