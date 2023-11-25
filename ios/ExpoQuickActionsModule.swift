import ExpoModulesCore

let onQuickAction = "onQuickAction"

struct ActionObject: Record {
  @Field var id: String? = nil
  @Field var title: String? = nil
  @Field var subtitle: String? = nil
  // @Field var icon: String? = nil
  @Field var userInfo: [String : NSSecureCoding]? = nil
}

func toActionObject(item: UIApplicationShortcutItem?) -> ActionObject? {
  if let item = item {
    // TODO: item.icon
    return ActionObject(
      id: item.type ,
      title: item.localizedTitle ,
      subtitle: item.localizedSubtitle,
      // icon: UIApplicationShortcutIcon.init(type: UIApplicationShortcutIcon.IconType.pause) "",
      userInfo: item.userInfo);
  }
  return nil
}

var initialAction: UIApplicationShortcutItem? = nil;

public class ExpoQuickActionsModule: Module {

  public func definition() -> ModuleDefinition {
  
    Name("ExpoQuickActions")

    Constants([
      "initial": toActionObject(item: initialAction)?.toDictionary()
    ])

    AsyncFunction("getInitial") { () -> ActionObject? in
      return toActionObject(item: initialAction)
    }

    AsyncFunction("setItems") { (items: [ActionObject]?) in

      if let items = items {
        UIApplication.shared.shortcutItems = []
        for item in items {
          UIApplication.shared.shortcutItems?.append(UIApplicationShortcutItem.init(
            type: item.id ?? "id",
            localizedTitle: item.title ?? "title",
            localizedSubtitle: item.subtitle,
            // TODO: item.icon
            icon: nil,
            userInfo: item.userInfo))
        }
      } else {
        UIApplication.shared.shortcutItems = nil
      }

    }.runOnQueue(.main)

    AsyncFunction("isSupported") { () -> Bool in
      if let window = UIApplication.shared.delegate?.window as? UIWindow {
        return window.rootViewController?.traitCollection.forceTouchCapability == .available
      }

      return false;
    }.runOnQueue(.main)

    Events(onQuickAction)

    OnStartObserving {
      let name = Notification.Name(onQuickAction)
      NotificationCenter.default.removeObserver(self, name: name, object: nil)
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.quickActionListener),
        name: name,
        object: nil
      )
    }

    OnStopObserving {
      let name = Notification.Name(onQuickAction)
      NotificationCenter.default.removeObserver(self, name: name, object: nil)
    }
  }

  @objc
  func quickActionListener(notifications: Notification) {
    if let item = notifications.object as? UIApplicationShortcutItem {
      if let action = toActionObject(item: item) {
        sendEvent(onQuickAction, action.toDictionary())
      }
    }
  }
}
