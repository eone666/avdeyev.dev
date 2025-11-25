"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RiGithubLine, RiLinkedinLine, RiTelegram2Line, RiMailLine, RiExternalLinkLine, RiInstagramLine } from "react-icons/ri"
import Image from "next/image"
import { SocialShare } from "./social-share"

const links = [
  {
    title: "GitHub",
    url: "https://github.com/eone666",
    icon: RiGithubLine,
  },
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/eone666/",
    icon: RiLinkedinLine,
  },
  {
    title: "Telegram",
    url: "https://t.me/eone666",
    icon: RiTelegram2Line,
  },
  {
    title: "Telegram Channel",
    url: "https://t.me/avdeyev_dev",
    icon: RiTelegram2Line,
  },
  {
    title: "Instagram",
    url: "https://instagram.com/avdeyev.dev",
    icon: RiInstagramLine,
  },
  {
    title: "Email Me",
    url: "mailto:contact@avdeyev.dev",
    icon: RiMailLine,
  },
]

export function ProfileCard() {
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
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium  overflow-hidden overflow-ellipsis whitespace-nowrap">{link.title}</span>
                  </div>
                  <RiExternalLinkLine className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
                </a>
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