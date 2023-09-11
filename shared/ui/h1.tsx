import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/shared/utils/shadcn";

export default function H1({
  children,
  className,
  ...props
}: PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
>) {
  return (
    <h1 className={cn("text-2xl font-bold sm:text-4xl", className)} {...props}>
      {children}
    </h1>
  );
}
