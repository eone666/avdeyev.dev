import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  SiGithub,
  SiLinkedin,
  SiTelegram,
} from "@icons-pack/react-simple-icons";
import Section from "@/app/(MainPage)/_components/section";
import H2 from "@/components/ui/h2";
import H1 from "@/components/ui/h1";
import H3 from "@/components/ui/h3";

export default function MainSection() {
  return (
    <Section className="flex flex-col items-center justify-center gap-3">
      <H1 className="text-center">Hello, World! I am Ivan.</H1>
      <H2 className="text-center">Frontend Developer</H2>
      <H3 className="text-center">#opentowork</H3>
      <ul className="flex items-center gap-2">
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
    </Section>
  );
}
