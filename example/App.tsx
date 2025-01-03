import * as QuickActions from "expo-quick-actions";
import { useQuickAction } from "expo-quick-actions/hooks";

import React from "react";
import { Platform, Text, View } from "react-native";
import AppIconTest from "./AppIconTest";

import * as AC from "@bacons/apple-colors";
// import { RouterAction, useQuickActionRouting } from "expo-quick-actions/router";
// function TypeTest() {
//   useQuickActionRouting();
//   React.useEffect(() => {
//     QuickActions.setItems<RouterAction<"/compose" | "/other">>([
//       {
//         title: "Compose",
//         icon: Platform.select({
//           ios: "symbol:heart",
//           android: "shortcut_compose",
//         }),
//         id: "compose",
//         params: {
//           href: "/compose",
//         },
//       },
//     ]);
//   }, []);
// }

export default function App() {
  const action = useQuickAction();

  console.log("action", action);

  React.useEffect(() => {
    QuickActions.setItems([
      {
        title: "Compose",
        icon: Platform.select({
          ios: "symbol:heart",
          android: "asset:shortcut_compose",
        }),
        id: "compose",
        params: {
          href: "/compose",
        },
      },
      {
        title: "Demo",
        icon: Platform.select({
          ios: "shortcut_two",
          default: "shortcut_three",
        }),
        id: "three",
      },
    ]);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: AC.systemBackground }}>
      <AppIconTest />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: AC.label }}>Quick Actions</Text>
        {action && (
          <Text style={{ color: AC.label }}>
            {JSON.stringify(action, null, 2)}
          </Text>
        )}
      </View>
    </View>
  );
}
