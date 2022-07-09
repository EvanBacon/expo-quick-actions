import * as QuickActions from "expo-quick-actions";
import React from "react";
import { Text, View, Platform } from "react-native";

const NativeModule = Platform.select({
  ios: require("../ios/ExpoQuickActionsModule.swift"),
  android: require("../android/src/main/java/expo/modules.quickactions/ExpoQuickActionsModule.kt"),
});

console.log("yolo:", NativeModule);

function useQuickAction() {
  console.log("foobar:", QuickActions.initial);
  const [item, setItem] = React.useState(QuickActions.initial);
  const isMounted = React.useRef(true);
  React.useEffect(() => {
    const sub = QuickActions.addListener((event) => {
      console.log("Got:", event);
      if (isMounted.current) {
        // setItem(data);
      }
    });
    return () => {
      isMounted.current = false;
      sub.remove();
    };
  }, []);
  return item;
}

export default function App() {
  QuickActions.getInitial().then(console.log);

  const action = useQuickAction();

  React.useEffect(() => {
    QuickActions.setItems([
      {
        title: "Play Song",
        // subtitle: "NDA - Billie Eilish",
        // icon: "Play",
        type: "alpha",
      },
      // {
      //   title: "Shuffle",
      //   icon: "Shuffle",
      //   type: "beta",
      // },
      // {
      //   title: "Like Song",
      //   icon: "Love",
      //   type: "gamma",
      // },
    ]);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Quick Actions</Text>
      {action && <Text>{JSON.stringify(action, null, 2)}</Text>}
    </View>
  );
}
