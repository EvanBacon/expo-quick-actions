import ExpoAppIcon from "./icon";
import React from "react";
// @ts-ignore
import { ICONS } from "expo-quick-actions/icon/types";
const DynamicIconContext = React.createContext({
    iconName: null,
    setIconName: () => { },
});
export default function DynamicIconProvider({ children, }) {
    const [iconName, setIconName] = useIconName();
    return (<DynamicIconContext.Provider value={{ iconName, setIconName }}>
      {children}
    </DynamicIconContext.Provider>);
}
const useIconName = !ExpoAppIcon ? useIconNameExpoGo : useIconNameCustom;
function useIconNameExpoGo() {
    return React.useState(null);
}
function useIconNameCustom() {
    const [icon, _setIcon] = React.useState(null);
    React.useEffect(() => {
        let isMounted = true;
        ExpoAppIcon?.getIcon().then((icon) => {
            if (isMounted)
                _setIcon(icon || null);
        });
        return () => {
            isMounted = false;
        };
    }, []);
    const setIcon = React.useCallback((icon) => {
        ExpoAppIcon?.setIcon(icon);
        _setIcon(icon || null);
    }, [_setIcon]);
    return [icon, setIcon];
}
export function useSelectedIconSource() {
    const [_icon] = useAppIcon();
    return React.useMemo(() => {
        const icon = ICONS.find((icon) => icon.id === _icon);
        return icon ? icon.src : null;
    }, [_icon]);
}
export function useAppIcon() {
    const ctx = React.useContext(DynamicIconContext);
    if (!ctx)
        throw new Error("Missing DynamicIconProvider");
    return [ctx.iconName, ctx.setIconName];
}
//# sourceMappingURL=icon-hooks.js.map