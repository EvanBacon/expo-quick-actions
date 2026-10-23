//
//  ExpoQuickActionsAppDelegate.swift
//  ExpoQuickActions
//
//  Created by Evan Bacon on 6/11/22.
//

import ExpoModulesCore

public class ExpoQuickActionsAppDelegate: ExpoAppDelegateSubscriber {

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    if let item = launchOptions?[.shortcutItem] as? UIApplicationShortcutItem {
      initialAction = item
    }
    return true
  }

  public func application(_ application: UIApplication, performActionFor shortcutItem: UIApplicationShortcutItem, completionHandler: @escaping (Bool) -> Void) {
    if isObservingQuickActions {
      NotificationCenter.default.post(name: Notification.Name(onQuickAction), object: shortcutItem)
    } else if shortcutItem.type != initialAction?.type {
      // JS isn't listening yet; the module emits this once observing starts.
      // A cold launch also calls this with the launch item, which JS already gets as `initial`.
      pendingAction = shortcutItem
    }
    completionHandler(true)
  }
}
