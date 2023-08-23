"use client";

import { useState, useEffect, DetailedHTMLProps, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TypewriterProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  text: string;
  delay: number;
  infinite?: boolean;
}

const Typewriter = ({
  text,
  delay,
  infinite,
  className,
  ...props
}: TypewriterProps) => {
  const [currentText, setCurrentText] = useState(text);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentText("");
    setMounted(true);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);
    } else if (infinite) {
      setCurrentIndex(0);
      setCurrentText("");
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, delay, infinite, text]);

  return (
    <span className={cn({ hidden: !mounted }, className)} {...props}>
      {currentText}
    </span>
  );
};

export default Typewriter;
