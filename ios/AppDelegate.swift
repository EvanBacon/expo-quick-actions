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
    // Under the UIKit scene lifecycle a cold-start shortcut is not in launchOptions. It arrives here,
    // forwarded from the scene connection options, before JS has read the module. Keep it as the
    // initial action until JS has read `QuickActions.initial`; after that it is a normal warm event.
    if !didExportInitialAction {
      initialAction = shortcutItem
    }
    NotificationCenter.default.post(name: Notification.Name(onQuickAction), object: shortcutItem)
    completionHandler(true)
  }
}
