"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { forwardRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const ThemeIcon = forwardRef<SVGSVGElement, { theme?: string }>(
  function ThemeIcon({ theme }, ref) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);
    return (
      <>
        {isClient ? (
          theme === "light" ? (
            <Moon ref={ref} />
          ) : (
            <Sun ref={ref} />
          )
        ) : null}
      </>
    );
  },
);

const MotionThemeIcon = motion(ThemeIcon);

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
      aria-label={theme === "light" ? "Dark theme" : "Light theme"}
    >
      <MotionThemeIcon
        initial={{ opacity: 0 }}
        animate={{ opacity: "100%" }}
        transition={{ duration: 0.3 }}
        theme={theme}
      />
    </Button>
  );
}
