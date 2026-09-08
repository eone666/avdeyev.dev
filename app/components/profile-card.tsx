import { ButtonLink } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  RiGithubLine,
  RiLinkedinLine,
  RiTelegram2Line,
  RiMailLine,
  RiExternalLinkLine,
  RiInstagramLine,
  RiFileTextLine
} from '@/components/icons'
import SocialShare from '@/islands/social-share'
import { POTD } from '@/components/potd'

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
    url: "/cv.pdf",
    icon: RiFileTextLine,
    external: true
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

export function ProfileCard() {
  return (
    <Card class="pixel-panel w-full max-w-md p-8 bg-card border-border">
      <div class="flex flex-col items-center gap-6">
        {/* Profile Section */}
        <div class="flex flex-col items-center gap-4 text-center">
          {/* Wordmark instead of the logo image — no plate, no image request.
              font-bold is 700, which is the top of Pixelify Sans' wght axis. */}
          {/* Fluid: the wordmark has no break opportunity, so a fixed size
              could overflow the card on a narrow screen. */}
          <span class="pixel-mark font-pixel text-primary text-[clamp(1.5rem,8vw,3rem)] font-bold leading-none">
            AVDEYEV.DEV
          </span>

          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-foreground">Ivan Avdeyev</h1>
            <p class="text-muted-foreground">Frontend Developer</p>
          </div>

          <POTD />

        </div>

        {/* Main Links */}
        <div class="w-full space-y-3">
          {links.map((link, index) => {
            const Icon = link.icon
            return (
              <ButtonLink
                key={index}
                variant="secondary"
                class="pixel-btn w-full h-14 justify-between group hover:bg-secondary/80 hover:border-primary/50 border border-transparent overflow-hidden"
                href={link.url}
                target={link.external ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                  <Icon class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span class="font-medium  overflow-hidden overflow-ellipsis whitespace-nowrap">{link.title}</span>
                </div>
                {link.external && <RiExternalLinkLine class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />}
              </ButtonLink>
            )
          })}
        </div>

        <div class="flex gap-2 items-center">
          <SocialShare title="Check out Ivan Avdeyev's link hub!" />
        </div>
      </div>
    </Card>
  )
}
