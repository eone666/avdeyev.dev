"use client";

import { useState, useEffect, DetailedHTMLProps, HTMLAttributes } from "react";

export interface TypewriterProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  text: string;
  delay: number;
  infinite?: boolean;
}

const Typewriter = ({ text, delay, infinite, ...props }: TypewriterProps) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (currentIndex <= text.length) {
      timeout = setTimeout(() => {
        if (currentIndex < text.length) {
          setCurrentText((prevText) => prevText + text[currentIndex]);
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }
      }, delay);
    } else if (infinite) {
      setCurrentIndex(0);
      setCurrentText("");
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, delay, infinite, text]);

  return <span {...props}>{currentText}</span>;
};

export default Typewriter;
