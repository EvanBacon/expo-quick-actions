import Entypo from "@expo/vector-icons/Entypo";
import React from "react";
import { Image, SafeAreaView, Text, View } from "react-native";
import { ExpoAppIcon } from "expo-quick-actions/build/icon";
import TouchableBounce from "react-native/Libraries/Components/Touchable/TouchableBounce";

function useIconName() {
  const [icon, _setIcon] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    ExpoAppIcon.getIcon().then((result) => {
      if (isMounted) _setIcon(result);
    });
    return () => (isMounted = false);
  }, []);

  const setIcon = React.useCallback(
    (icon) => {
      ExpoAppIcon.setIcon(icon).then(() => {
        _setIcon(icon || null);
      });
    },
    [_setIcon]
  );
  return [icon === "default" ? null : icon, setIcon];
}

// TODO: Auto generate in config plugin
// TODO: Android versions
const icons = [
  {
    source: {
      uri: "AppIcon60x60",
    },
    id: null,
  },
  {
    source: {
      uri: "0-Icon-60x60",
    },
    id: "0",
  },
  {
    source: {
      uri: "1-Icon-60x60",
    },
    id: "1",
  },
  {
    source: {
      uri: "2-Icon-60x60",
    },
    id: "2",
  },
];

export default function AppIconTest() {
  const [_icon, setIcon] = useIconName();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ width: "100%" }}>
        {icons.map((icon, index) => {
          return (
            <Item
              onPress={() => {
                setIcon(icon.id);
              }}
              isSelected={icon.id === _icon}
              name={"icon"}
              source={icon.source}
              key={String(index)}
            />
          );
        })}
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

          backgroundColor: props.isSelected ? "#000" : "#F1F1F1",
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
                color: props.isSelected ? "white" : "black",
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
              color="white"
            />
          )}
        </View>
      </View>
    </TouchableBounce>
  );
}
