import Link from "next/link";
import { buttonVariants } from "@/shared/ui/button";
import { WithClassName } from "@/shared/types/with-className";
import { cn } from "@/shared/utils/shadcn";

export interface TextMenuProps extends WithClassName {
  orientation?: "horizontal" | "vertical";
}

export default function TextMenu({
  className,
  orientation = "horizontal",
}: TextMenuProps) {
  return (
    <ul
      className={cn(
        "flex items-center gap-2",
        {
          "flex-row": orientation === "horizontal",
          "flex-col": orientation === "vertical",
        },
        className,
      )}
    >
      <li
        className={cn({
          "w-full": orientation === "vertical",
        })}
      >
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost" }), {
            "w-full": orientation === "vertical",
          })}
        >
          About
        </Link>
      </li>
      <li
        className={cn({
          "w-full": orientation === "vertical",
        })}
      >
        <Link
          href="/experience"
          className={cn(buttonVariants({ variant: "ghost" }), {
            "w-full": orientation === "vertical",
          })}
        >
          Experience
        </Link>
      </li>
    </ul>
  );
}
