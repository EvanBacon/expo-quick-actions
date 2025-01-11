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
    NotificationCenter.default.post(name: Notification.Name(onQuickAction), object: shortcutItem)
    completionHandler(true)
  }
}
