import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { WithClassName } from "@/shared/types/with-className";
import { cn } from "@/shared/utils/shadcn";

export default function TextMenu({ className }: WithClassName) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      <li>
        <Button asChild variant="ghost">
          <Link href="#">Home</Link>
        </Button>
      </li>
      <li>
        <Button asChild variant="ghost">
          <Link href="#">About</Link>
        </Button>
      </li>
      <li>
        <Button asChild variant="ghost">
          <Link href="#">Experience</Link>
        </Button>
      </li>
      <li>
        <Button asChild variant="ghost">
          <Link href="#">CV</Link>
        </Button>
      </li>
    </ul>
  );
}
