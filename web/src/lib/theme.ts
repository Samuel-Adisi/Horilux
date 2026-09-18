import { useLayoutEffect } from "react";
import { useAuthStore } from "@/features/accounts/store/auth-store";
import { primaryRole } from "@/features/accounts/permissions";

export type ThemeName = "staff" | "ceo";

/** CEO accounts get the dark command-centre theme; every other role gets the warm staff theme. */
export function useTheme(): ThemeName {
  const user = useAuthStore((s) => s.user);
  return primaryRole(user) === "CEO" ? "ceo" : "staff";
}

/** Applies the theme to <html> for the lifetime of the signed-in shell. */
export function useApplyTheme(theme: ThemeName) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === "ceo") root.dataset.theme = "ceo";
    else delete root.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "ceo" ? "#0b0f19" : "#240270");
    return () => {
      delete root.dataset.theme;
    };
  }, [theme]);
}
