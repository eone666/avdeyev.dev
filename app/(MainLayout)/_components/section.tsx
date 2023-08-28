import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from "react";
import Container from "@/components/ui/container";
import { cn } from "@/lib/utils";

export default function Section({
  children,
  className,
  ...props
}: PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
>) {
  return (
    <section className="h-screen-wo-hf snap-center overflow-hidden" {...props}>
      <Container className={cn("h-full", className)}>{children}</Container>
    </section>
  );
}
