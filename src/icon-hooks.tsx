import { ExpoAppIcon } from "./icon";
import React from "react";

import { ICONS } from "./dynamic-app-icons";

const DynamicIconContext = React.createContext<{
  iconName: string | null;
  setIconName: (iconName: string | null) => void;
}>({
  iconName: null,
  setIconName: () => {},
});

export default function DynamicIconProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [iconName, setIconName] = useIconName();

  return (
    <DynamicIconContext.Provider value={{ iconName, setIconName }}>
      {children}
    </DynamicIconContext.Provider>
  );
}

const useIconName = !ExpoAppIcon ? useIconNameExpoGo : useIconNameCustom;

function useIconNameExpoGo(): [string | null, (name: string | null) => void] {
  return React.useState<string | null>(null);
}

function useIconNameCustom(): [string | null, (name: string | null) => void] {
  const [icon, _setIcon] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    ExpoAppIcon?.getIcon().then((icon) => {
      if (isMounted) _setIcon(icon || null);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setIcon = React.useCallback(
    (icon: string | null) => {
      ExpoAppIcon?.setIcon(icon);
      _setIcon(icon || null);
    },
    [_setIcon]
  );
  return [icon, setIcon];
}

export function useSelectedIconSource(): any | null {
  const [_icon] = useAppIcon();

  return React.useMemo(() => {
    const icon = ICONS.find((icon) => icon.id === _icon);
    return icon ? icon.src : null;
  }, [_icon]);
}

export function useAppIcon() {
  const ctx = React.useContext(DynamicIconContext);
  if (!ctx) throw new Error("Missing DynamicIconProvider");
  return [ctx.iconName, ctx.setIconName];
}
