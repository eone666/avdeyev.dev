"use client";

import { cn } from "@/shared/utils/shadcn";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { Menu } from "lucide-react";
import Logo from "@/widgets/header/ui/logo";
import { Socials } from "@/features/socials";
import TextMenu from "./text-menu";
import { buttonVariants } from "@/shared/ui/button";

export interface NavigationProps {
  isMainPage?: boolean;
}
export function Navigation({ isMainPage }: NavigationProps) {
  return (
    <div
      className={cn("flex w-full items-center justify-between", {
        "justify-between": !isMainPage,
        "justify-end lg:justify-center": isMainPage,
      })}
    >
      <div
        className={cn("flex flex-1 justify-start", {
          hidden: isMainPage,
        })}
      >
        <Logo />
      </div>
      {/*DESKTOP*/}
      <nav className="hidden flex-1 justify-center lg:flex">
        <TextMenu />
      </nav>
      <div
        className={cn("hidden flex-1 justify-end", {
          "lg:flex": !isMainPage,
        })}
      >
        <Socials />
      </div>
      {/*MOBILE*/}
      <Sheet>
        <SheetTrigger
          className={cn(buttonVariants({ variant: "ghost" }), "lg:hidden")}
        >
          <Menu />
        </SheetTrigger>
        <SheetContent className="flex flex-col gap-3">
          <TextMenu className="flex-1 border-b" orientation={"vertical"} />
          <Socials />
        </SheetContent>
      </Sheet>
    </div>
  );
}
