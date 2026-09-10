import { ButtonLink } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/icon'
import SocialShare from '@/islands/social-share'
import { POTD } from '@/components/potd'

const links = [
  {
    title: "GitHub",
    url: "https://github.com/eone666",
    icon: "github-line" as const,
    external: true
  },
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/eone666/",
    icon: "linkedin-line" as const,
    external: true
  },
  {
    title: "CV",
    url: "/cv.pdf",
    icon: "file-text-line" as const,
    external: true
  },
  {
    title: "Telegram",
    url: "https://t.me/eone666",
    icon: "telegram-2-line" as const,
    external: true
  },
  {
    title: "Telegram Channel",
    url: "https://t.me/avdeyev_dev",
    icon: "telegram-2-line" as const,
    external: true
  },
  {
    title: "Instagram",
    url: "https://instagram.com/avdeyev.dev",
    icon: "instagram-line" as const,
    external: true
  },
  {
    title: "Email Me",
    url: "mailto:contact@avdeyev.dev",
    icon: "mail-line" as const,
  },
]

export function ProfileCard() {
  return (
    <Card class="w-full max-w-md p-8 bg-card border-border">
      {/* A container, so the wordmark below can size itself against the card
          rather than the viewport. */}
      <div class="@container flex flex-col items-center gap-6">
        {/* Profile Section */}
        <div class="flex flex-col items-center gap-4 text-center">
          {/* Wordmark instead of the logo image — no plate, no image request.
              font-bold is 700, which is the top of Pixelify Sans' wght axis. */}
          {/* Fluid, and measured against the card rather than the viewport:
              the wordmark is a constant 6.24em wide and has no break
              opportunity, so 14.7cqw holds it at ~92% of the card on any
              screen. In vw it tracked the window instead and stalled at 78%
              the moment the card stopped growing. */}
          <span class="pixel-mark font-pixel text-primary text-[clamp(1.5rem,14.7cqw,3.6rem)] font-bold leading-none">
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
            return (
              <ButtonLink
                key={index}
                variant="secondary"
                class="w-full h-14 justify-between group hover:bg-secondary/80 hover:border-primary/50 border border-transparent overflow-hidden"
                href={link.url}
                target={link.external ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                  <Icon name={link.icon} class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span class="font-medium  overflow-hidden overflow-ellipsis whitespace-nowrap">{link.title}</span>
                </div>
                {link.external && <Icon name="external-link-line" class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />}
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
