import ExpoModulesCore

public class ExpoAppIcon: Module {
  public func definition() -> ModuleDefinition {
    
    Name("ExpoAppIcon")

        Constants([
            "isSupported": UIApplication.shared.supportsAlternateIcons
        ])

     AsyncFunction("setIcon") { (name: String?, promise: Promise) in
            if UIApplication.shared.supportsAlternateIcons {
                UIApplication.shared.setAlternateIconName(name) { error in
                    if let error = error {
                        promise.reject(error)
                    } else {
                        promise.resolve(UIApplication.shared.alternateIconName)
                    }
                }
            } else {
                promise.resolve(nil)
            }
        }.runOnQueue(.main)

      AsyncFunction("getIcon") { (promise: Promise) in
            
            if UIApplication.shared.supportsAlternateIcons {
                promise.resolve(UIApplication.shared.alternateIconName)
                return
            }
            
            promise.resolve(nil)
            
        }.runOnQueue(.main)

  }
}