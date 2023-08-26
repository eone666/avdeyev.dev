import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TextMenu() {
  return (
    <ul className="flex items-center gap-2">
      <li>
        <Button asChild variant="ghost">
          <Link href="#">Home</Link>
        </Button>
      </li>
      <li>
        <Button asChild variant="ghost">
          <Link href="#">Projects</Link>
        </Button>
      </li>
      <li>
        <Button asChild variant="ghost">
          <Link href="#">Repositories</Link>
        </Button>
      </li>
      <li>
        <Button asChild variant="ghost">
          <Link href="#">Blog</Link>
        </Button>
      </li>
    </ul>
  );
}
