import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/container";

export default function Section({
  children,
  className,
  ...props
}: PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
>) {
  return (
    <section className={cn("h-screen-no-h snap-center", className)} {...props}>
      <Container className={className}>{children}</Container>
    </section>
  );
}
