"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeChanger() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      onClick={toggle}
      size="icon"
      className="animate-fade-in"
      aria-label={theme === "light" ? "Dark theme" : "Light theme"}
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
