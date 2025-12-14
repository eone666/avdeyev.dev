import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RiGithubLine, RiLinkedinLine, RiTelegram2Line, RiMailLine, RiExternalLinkLine, RiInstagramLine, RiFileTextLine } from "react-icons/ri"
import Image from "next/image"
import { SocialShare } from "./social-share"
import Link from "next/link"
import { MinecraftText } from "./minecraft-text"
import { phrases } from "@/app/phrases"

const links = [
  {
    title: "GitHub",
    url: "https://github.com/eone666",
    icon: RiGithubLine,
    external: true
  },
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/eone666/",
    icon: RiLinkedinLine,
    external: true
  },
  {
    title: "CV",
    url: "/cv",
    icon: RiFileTextLine,
  },
  {
    title: "Telegram",
    url: "https://t.me/eone666",
    icon: RiTelegram2Line,
    external: true
  },
  {
    title: "Telegram Channel",
    url: "https://t.me/avdeyev_dev",
    icon: RiTelegram2Line,
    external: true
  },
  {
    title: "Instagram",
    url: "https://instagram.com/avdeyev.dev",
    icon: RiInstagramLine,
    external: true
  },
  {
    title: "Email Me",
    url: "mailto:contact@avdeyev.dev",
    icon: RiMailLine,
  },
]

function seededRandom(seed: number) {
  return Math.sin(seed) * 10000 % 1;
}

export function getPhraseOfTheDay(): string {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();

  const start = new Date(Date.UTC(1999, 11, 22));

  const diffDays = Math.floor(
    (Date.UTC(utcYear, utcMonth, utcDate) - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const shuffledIndex = (diffDays * 7) % phrases.length;

  return phrases[shuffledIndex];
}

export async function ProfileCard() {
  const dailyText = getPhraseOfTheDay()
  return (
    <Card className="w-full max-w-md p-8 bg-card border-border">
      <div className="flex flex-col items-center gap-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-24 w-24 rounded-full shadow-[0_0_15px_rgba(190,242,2,0.5)] overflow-hidden bg-primary flex items-center justify-center">
            <Image src="/logo.webp" fetchPriority="high" alt="Logo" width={96} height={96} className="object-cover" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Ivan Avdeyev</h1>
            <p className="text-muted-foreground">Frontend Developer</p>
          </div>

          <MinecraftText text={dailyText} />
        </div>

        {/* Main Links */}
        <div className="w-full space-y-3">
          {links.map((link, index) => {
            const Icon = link.icon
            return (
              <Button
                key={index}
                variant="secondary"
                className="w-full h-14 justify-between group hover:bg-secondary/80 hover:border-primary/50 border border-transparent transition-all overflow-hidden"
                asChild
              >
                <Link href={link.url} target={link.external ? '_blank' : undefined} rel="noopener noreferrer">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium  overflow-hidden overflow-ellipsis whitespace-nowrap">{link.title}</span>
                  </div>
                  {link.external && <RiExternalLinkLine className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />}
                </Link>
              </Button>
            )
          })}
        </div>

        <div className="flex gap-2 items-center">
          <SocialShare title="Check out Ivan Avdeyev's link hub!" />
        </div>
      </div>
    </Card>
  )
}