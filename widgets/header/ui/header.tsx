"use client";

import Container from "@/shared/ui/container";
import Logo from "@/widgets/header/ui/logo";
import { cn } from "@/shared/utils/shadcn";
import { TextMenu } from "@/fetures/text-menu";
import { useEffect, useState } from "react";
import { Socials } from "@/fetures/socials";

export interface HeaderProps {
  mainPage?: boolean;
}

export default function Header({ mainPage }: HeaderProps) {
  const [top, setTop] = useState(mainPage);

  useEffect(() => {
    const scrollHandler = () => {
      setTop(window.scrollY <= 40);
    };

    if (mainPage) {
      window.addEventListener("scroll", scrollHandler);
      scrollHandler();
    }

    return () => {
      if (mainPage) {
        window.removeEventListener("scroll", scrollHandler);
      }
    };
  }, []);

  return (
    <header
      className={cn("fixed left-0 right-0 top-0 flex h-header items-center", {
        "border-b bg-background/60 backdrop-blur": !top,
      })}
    >
      <Container
        className={cn("flex items-center justify-between", {
          "justify-between": !top,
          "justify-center": top,
        })}
      >
        <div
          className={cn("flex flex-1 justify-start", {
            hidden: top,
          })}
        >
          <Logo />
        </div>
        <nav className="flex flex-1 justify-center">
          <TextMenu />
        </nav>
        <div
          className={cn("flex flex-1 justify-end", {
            hidden: top,
          })}
        >
          <Socials />
        </div>
      </Container>
    </header>
  );
}
