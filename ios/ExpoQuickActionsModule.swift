import ExpoModulesCore
import UIKit

let onQuickAction = "onQuickAction"

let iconTypeMap: [String: UIApplicationShortcutIcon.IconType] = [
    "compose": .compose,
    "play": .play,
    "pause": .pause,
    "add": .add,
    "location": .location,
    "search": .search,
    "share": .share,
    "prohibit": .prohibit,
    "contact": .contact,
    "home": .home,
    "markLocation": .markLocation,
    "favorite": .favorite,
    "love": .love,
    "cloud": .cloud,
    "invitation": .invitation,
    "confirmation": .confirmation,
    "mail": .mail,
    "message": .message,
    "date": .date,
    "time": .time,
    "capturePhoto": .capturePhoto,
    "captureVideo": .captureVideo,
    "task": .task,
    "taskCompleted": .taskCompleted,
    "alarm": .alarm,
    "bookmark": .bookmark,
    "shuffle": .shuffle,
    "audio": .audio,
    "update": .update
]

struct ActionObject: Record {
    @Field var id: String? = nil
    @Field var title: String? = nil
    @Field var subtitle: String? = nil
    @Field var icon: String? = nil
    @Field var params: [String: NSSecureCoding]? = nil
}

func createShortcutIcon(from typeName: String?) -> UIApplicationShortcutIcon? {
    guard let typeName = typeName else { return nil }
    
    let prefixToIconType: [(String, (String) -> UIApplicationShortcutIcon)] = [
        ("symbol:", UIApplicationShortcutIcon.init(systemImageName:)),
        ("asset:", UIApplicationShortcutIcon.init(templateImageName:))
    ]
    
    for (prefix, iconInitializer) in prefixToIconType {
        if typeName.starts(with: prefix) {
            return iconInitializer(String(typeName.dropFirst(prefix.count)))
        }
    }
    
    return iconTypeMap[typeName].map(UIApplicationShortcutIcon.init(type:)) ??
    UIApplicationShortcutIcon(systemImageName: typeName)
}

func toActionObject(item: UIApplicationShortcutItem?) -> ActionObject? {
    guard let item = item else { return nil }
    return ActionObject(
        id: item.type,
        title: item.localizedTitle,
        subtitle: item.localizedSubtitle,
        params: item.userInfo
    )
}

var initialAction: UIApplicationShortcutItem?

public class ExpoQuickActionsModule: Module {
    
    public func definition() -> ModuleDefinition {
        Name("ExpoQuickActions")
        
        Constants([
            "initial": toActionObject(item: initialAction)?.toDictionary()
        ])
                
        AsyncFunction("setItems") { (items: [ActionObject]?) in
            UIApplication.shared.shortcutItems = items?.map { item in
                UIApplicationShortcutItem(
                    type: item.id ?? "id",
                    localizedTitle: item.title ?? "title",
                    localizedSubtitle: item.subtitle,
                    icon: createShortcutIcon(from: item.icon),
                    userInfo: item.params
                )
            }
        }.runOnQueue(.main)
        
        AsyncFunction("isSupported") { () -> Bool in
            UIApplication.shared.delegate?.window??
                .rootViewController?.traitCollection.forceTouchCapability == .available
        }.runOnQueue(.main)
        
        Events(onQuickAction)
        
        OnStartObserving {
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(self.quickActionListener),
                name: Notification.Name(onQuickAction),
                object: nil
            )
        }
        
        OnStopObserving {
            NotificationCenter.default.removeObserver(
                self,
                name: Notification.Name(onQuickAction),
                object: nil
            )
        }
    }
    
    @objc
    func quickActionListener(notifications: Notification) {
        guard let item = notifications.object as? UIApplicationShortcutItem,
              let action = toActionObject(item: item) else { return }
        sendEvent(onQuickAction, action.toDictionary())
    }
}
