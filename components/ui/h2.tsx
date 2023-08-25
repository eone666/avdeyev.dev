import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export default function H2({
  children,
  className,
  ...props
}: PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
>) {
  return (
    <h2 className={cn("text-xl sm:text-3xl", className)} {...props}>
      {children}
    </h2>
  );
}
