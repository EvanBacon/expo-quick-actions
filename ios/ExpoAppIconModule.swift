import ExpoModulesCore

public class ExpoAppIconModule: Module {
  public func definition() -> ModuleDefinition {
    
    Name("ExpoAppIcon")

        Constants([
            "isSupported": UIApplication.shared.supportsAlternateIcons
        ])

     AsyncFunction("setIcon") { (name: String?, promise: Promise) in
            if UIApplication.shared.supportsAlternateIcons {
                UIApplication.shared.setAlternateIconName(name == nil ? nil : "expo_ic_\(name!)") { error in
                    if let error = error {
                        promise.reject(error)
                    } else {
                        if let iconName = UIApplication.shared.alternateIconName {
                            promise.resolve(iconName.replacingOccurrences(of: "expo_ic_", with: ""))
                        } else {
                            promise.resolve(nil)
                        }
                    }
                }
            } else {
                promise.resolve(nil)
            }
        }.runOnQueue(.main)

      AsyncFunction("getIcon") { (promise: Promise) in
            
            if UIApplication.shared.supportsAlternateIcons {
                 if let iconName = UIApplication.shared.alternateIconName {
                            promise.resolve(iconName.replacingOccurrences(of: "expo_ic_", with: ""))
                        } else {
                            promise.resolve(nil)
                        }

                return
            }
            
            promise.resolve(nil)
            
        }.runOnQueue(.main)
  }
}