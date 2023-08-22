import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  SiGithub,
  SiLinkedin,
  SiTelegram,
} from "@icons-pack/react-simple-icons";

export default async function Page() {
  return (
    <Container className="h-screen">
      <section className="flex h-full flex-col items-center justify-center gap-3">
        <h1 className="text-center text-2xl font-bold sm:text-5xl">
          Hello, World! I am Ivan.
        </h1>
        <h2 className="text-center text-xl sm:text-3xl">Frontend Developer</h2>
        <h3 className="text-center text-lg sm:text-2xl">#opentowork</h3>
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
      </section>
    </Container>
  );
}
