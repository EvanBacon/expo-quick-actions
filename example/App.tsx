import * as QuickActions from "expo-quick-actions";
import React from "react";
import { Text, View, Platform } from "react-native";

function useQuickActionCallback(
  callback?: (data: QuickActions.Action) => void | Promise<void>
) {
  React.useEffect(() => {
    let isMounted = true;

    if (QuickActions.initial) {
      callback?.(QuickActions.initial);
    }

    const sub = QuickActions.addListener((event) => {
      if (isMounted) {
        callback?.(event);
      }
    });
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [QuickActions.initial, callback]);
}

function useQuickAction() {
  const [action, setAction] = React.useState<QuickActions.Action | null>(
    QuickActions.initial ?? null
  );

  React.useEffect(() => {
    let isMounted = true;
    const sub = QuickActions.addListener((event) => {
      if (isMounted) {
        setAction(event);
      }
    });
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, []);

  return action;
}

export default function App() {
  const action = useQuickAction();
  console.log("action", action);

  React.useEffect(() => {
    QuickActions.setItems([
      {
        title: "Play Song",
        // subtitle: "NDA - Billie Eilish",
        icon: "symbol:gauge.open.with.lines.needle.84percent.exclamation",
        id: "alpha",
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
