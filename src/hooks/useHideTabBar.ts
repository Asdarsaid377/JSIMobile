import { useLayoutEffect } from "react";

import { useNavigation } from "@react-navigation/native";

// HARUS sama persis dengan tabBarStyle di AdminTabs.tsx/TimsesTabs.tsx supaya
// tab lain tidak berubah begitu balik dari screen yang pakai hook ini.
const TAB_BAR_STYLE_DEFAULT = { backgroundColor: "#ffffff", borderTopColor: "#cbd5e1" };

// Sembunyikan tab bar bawah selama screen ini aktif, restore ke default saat
// unmount. `getParent()` dari screen manapun di dalam HomeStack nyampe ke
// Tab.Navigator (pola sama `goToTab` di HomeScreen.tsx). Awalnya inline di
// CustomerServiceScreen (2026-08-22) — diekstrak jadi hook begitu dipakai di
// >=4 screen (Tokoh Masyarakat/Budgeting/Rival Caleg ditambah, permintaan user
// "hilangkan navbottom") supaya konstanta default ini tidak perlu disalin
// manual di tiap file — lihat progress-tracker.md Decisions.
export function useHideTabBar(): void {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: "none" } });
    return () => parent?.setOptions({ tabBarStyle: TAB_BAR_STYLE_DEFAULT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);
}
