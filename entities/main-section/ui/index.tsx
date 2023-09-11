import { Button } from "@/shared/ui/button";
import Link from "next/link";
import {
  SiGithub,
  SiLinkedin,
  SiTelegram,
} from "@icons-pack/react-simple-icons";
import Section from "@/shared/ui/section";
import H2 from "@/shared/ui/h2";
import H3 from "@/shared/ui/h3";

export default function MainSection() {
  return (
    <Section className="flex flex-col items-center justify-center gap-3">
      <h1 className="font-open-sans text-[min(12vw,100px)] font-light">
        AVDEYEV.DEV
      </h1>
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
