import Link from "next/link";
import { cn } from "@/shared/utils/shadcn";
import { WithClassName } from "@/shared/types/with-className";

export default function Logo({ className }: WithClassName) {
  return (
    <Link
      href="/"
      className={cn("font-open-sans text-xl sm:text-2xl", className)}
    >
      AVDEYEV.DEV
    </Link>
  );
}
