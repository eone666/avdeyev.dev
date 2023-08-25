import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export default function H3({
  children,
  className,
  ...props
}: PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
>) {
  return (
    <h3 className={cn("ext-lg sm:text-2xl", className)} {...props}>
      {children}
    </h3>
  );
}
