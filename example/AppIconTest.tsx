import Entypo from "@expo/vector-icons/Entypo";
import React from "react";
import { Image, SafeAreaView, Text, useColorScheme, View } from "react-native";
import * as ExpoAppIcon from "expo-quick-actions/icon";
import TouchableBounce from "react-native/Libraries/Components/Touchable/TouchableBounce";
import * as AC from "@bacons/apple-colors";

function useIconName() {
  const [icon, _setIcon] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    ExpoAppIcon.getIcon?.().then((result) => {
      if (isMounted) _setIcon(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setIcon = React.useCallback(
    (icon) => {
      _setIcon(icon || null);
      ExpoAppIcon.setIcon?.(icon);
    },
    [_setIcon]
  );
  return [icon === "default" ? null : icon, setIcon];
}

export default function AppIconTest() {
  const [_icon, setIcon] = useIconName();

  const isDark = useColorScheme() === "dark";
  const ICONS = [
    {
      id: null,
      src: isDark
        ? require("./assets/sunrise.png")
        : require("./assets/mountains.png"),
      name: "Adventure",
    },
    {
      id: "0",
      src: isDark
        ? require("./assets/space.png")
        : require("./assets/scifi.png"),
      name: "Sci-Fi",
    },
    {
      id: "1",
      src: isDark
        ? require("./assets/water.png")
        : require("./assets/landscape.png"),
      name: "Natural",
    },
  ] as const;

  if (!ExpoAppIcon.isSupported) {
    return <Text>App Icon is not supported</Text>;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ width: "100%" }}>
        {ICONS.map((icon, index) => (
          <Item
            onPress={() => setIcon(icon.id)}
            isSelected={icon.id === _icon}
            name={icon.name}
            source={icon.src}
            key={String(index)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

function Item({ ...props }) {
  return (
    <TouchableBounce
      onPress={props.onPress}
      style={{ marginVertical: 8, marginHorizontal: 24 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: props.isSelected ? 0.35 : 0.2,
          shadowRadius: 8.46,

          backgroundColor: props.isSelected
            ? AC.label
            : AC.secondarySystemGroupedBackground,
          elevation: 9,
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderRadius: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              alignItems: "center",
            }}
          >
            <Image
              source={props.source}
              style={{
                width: 64,
                aspectRatio: 1,
                resizeMode: "cover",
                borderRadius: 16,
              }}
            />
            <Text
              style={{
                marginLeft: 20,
                fontSize: 18,
                fontWeight: "700",
                color: props.isSelected ? AC.systemBackground : AC.label,
              }}
            >
              {props.name}
            </Text>
          </View>
          {props.isSelected && (
            <Entypo
              style={{ marginRight: 8 }}
              name="check"
              size={20}
              color={AC.systemBackground}
            />
          )}
        </View>
      </View>
    </TouchableBounce>
  );
}
