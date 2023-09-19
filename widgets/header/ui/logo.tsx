import Link from "next/link";
import { cn } from "@/shared/utils/shadcn";
import { WithClassname } from "@/shared/types/with-classname";

export default function Logo({ className }: WithClassname) {
  return (
    <Link
      href="/"
      className={cn("font-open-sans text-xl sm:text-2xl", className)}
    >
      AVDEYEV.DEV
    </Link>
  );
}
