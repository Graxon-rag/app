import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-8 h-8 rounded-lg
                 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100
                 hover:bg-zinc-100 dark:hover:bg-zinc-800
                 transition-all duration-150"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
    </button>
  );
}
