"use client";

import Container from "@/shared/ui/container";
import { cn } from "@/shared/utils/shadcn";
import { Navigation } from "@/features/navigation";

export interface HeaderProps {
  isMainPage?: boolean;
}

export default function Header({ isMainPage }: HeaderProps) {
  return (
    <header
      className={cn("fixed left-0 right-0 top-0 flex h-header items-center", {
        "border-b bg-background/60 backdrop-blur": !isMainPage,
      })}
    >
      <Container>
        <Navigation isMainPage={isMainPage} />
      </Container>
    </header>
  );
}
