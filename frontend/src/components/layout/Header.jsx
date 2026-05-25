import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export function Header({ title }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={cn(
      "h-13 shrink-0 flex items-center px-5 gap-4",
      "border-b border-border/40 bg-background/80 backdrop-blur-md",
    )}>
      {/* Page title */}
      <h1 className="text-sm font-semibold text-foreground/80 tracking-tight flex-1 truncate">
        {title}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
          onClick={toggleTheme}
          title={theme === "dark" ? "Mode clair" : "Mode sombre"}
        >
          {theme === "dark"
            ? <Sun size={15} />
            : <Moon size={15} />}
        </Button>
      </div>
    </header>
  );
}
