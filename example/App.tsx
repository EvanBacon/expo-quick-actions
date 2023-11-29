import * as QuickActions from "expo-quick-actions";
import { useQuickAction } from "expo-quick-actions/hooks";
import React from "react";
import { Text, View } from "react-native";

export default function App() {
  const action = useQuickAction();

  console.log("action", action);

  React.useEffect(() => {
    QuickActions.setItems([
      {
        title: "Compose",
        icon: "shortcut_compose",
        id: "compose",
        params: {
          href: "/compose",
        },
      },
      {
        title: "Demo",
        icon: "shortcut_three",
        id: "three",
      },
    ]);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Quick Actions</Text>
      {action && <Text>{JSON.stringify(action, null, 2)}</Text>}
    </View>
  );
}
