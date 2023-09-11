import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from "react";
import Container from "@/shared/ui/container";
import { cn } from "@/shared/utils/shadcn";

export default function Section({
  children,
  className,
  ...props
}: PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
>) {
  return (
    <section {...props}>
      <Container className={cn("min-h-screen", className)}>
        {children}
      </Container>
    </section>
  );
}
