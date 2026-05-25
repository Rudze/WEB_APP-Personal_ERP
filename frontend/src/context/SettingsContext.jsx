import { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

function hexToHsl(hex) {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(l * 100)}%`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return `${Math.round((h / 6) * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const { setTheme } = useTheme();

  const { data: config } = useQuery({
    queryKey: ["public-config"],
    queryFn: () => publicApi.getConfig().then((r) => r.data),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!config?.primaryColor) return;
    const hsl = hexToHsl(config.primaryColor);
    if (!hsl) return;
    document.documentElement.style.setProperty("--primary", hsl);
    document.documentElement.style.setProperty("--ring", hsl);
  }, [config?.primaryColor]);

  useEffect(() => {
    if (!config?.defaultTheme) return;
    if (!localStorage.getItem("theme")) {
      setTheme(config.defaultTheme);
    }
  }, [config?.defaultTheme, setTheme]);

  return (
    <SettingsContext.Provider value={config || {}}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
