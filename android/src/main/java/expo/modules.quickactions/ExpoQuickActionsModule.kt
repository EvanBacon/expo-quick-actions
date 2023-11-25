package expo.modules.quickactions

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoQuickActionsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoQuickActions")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }
  }
}
