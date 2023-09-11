import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/shared/utils/shadcn";

export default function Container({
  children,
  className,
  ...props
}: PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>) {
  return (
    <div className={cn("container mx-auto w-full", className)} {...props}>
      {children}
    </div>
  );
}
