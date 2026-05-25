import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function Header({ title }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-11 shrink-0 flex items-center px-5 gap-3 border-b border-border/30 bg-background/70 backdrop-blur-sm">
      <div className="h-3 w-px bg-border/50" />
      <h1 className="text-xs font-medium text-muted-foreground/70 tracking-widest uppercase flex-1 truncate">
        {title}
      </h1>
      <button
        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/5 transition-all duration-150"
        onClick={toggleTheme}
        title={theme === "dark" ? "Mode clair" : "Mode sombre"}
      >
        {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
      </button>
    </header>
  );
}
