import { Button } from "@/shared/ui/button";
import Link from "next/link";
import {
  SiGithub,
  SiLinkedin,
  SiTelegram,
} from "@icons-pack/react-simple-icons";

export default function Socials() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-2">
      <li>
        <Button asChild variant="ghost" size="icon">
          <Link href="https://t.me/eone666" target="_blank">
            <SiTelegram />
          </Link>
        </Button>
      </li>
      <li>
        <Button asChild variant="ghost" size="icon">
          <Link href="https://www.linkedin.com/in/eone666/" target="_blank">
            <SiLinkedin />
          </Link>
        </Button>
      </li>
      <li>
        <Button asChild variant="ghost" size="icon">
          <Link href="https://github.com/eone666" target="_blank">
            <SiGithub />
          </Link>
        </Button>
      </li>
    </ul>
  );
}
