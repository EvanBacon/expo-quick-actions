package expo.modules.quickactions

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoQuickActionsModule : Module() {
  override fun definition() = ModuleDefinition {
    name("ExpoQuickActions")

    function("helloAsync") { options: Map<String, String> ->
      println("Hello 👋")
    }
  }
}
