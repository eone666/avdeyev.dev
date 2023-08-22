import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex h-footer items-center border-t bg-background">
      <Container className="flex items-center justify-center">
        <ul className="flex items-center gap-2">
          <li>
            <Button asChild variant="link">
              <Link href="https://t.me/eone666" target="_blank">
                Telegram
              </Link>
            </Button>
          </li>
          <li>
            <Button asChild variant="link">
              <Link href="https://www.linkedin.com/in/eone666/" target="_blank">
                LinkedIn
              </Link>
            </Button>
          </li>
          <li>
            <Button asChild variant="link">
              <Link href="https://github.com/eone666" target="_blank">
                GitHub
              </Link>
            </Button>
          </li>
        </ul>
      </Container>
    </footer>
  );
}
