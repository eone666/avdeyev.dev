import { Button, ButtonLink } from '@/components/ui/button'
import { Icon } from '@/components/icon'

type SocialShareProps = {
  url: string
  title: string
}

export function SocialShare({ url, title }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const links = [
    { label: 'X (Twitter)', icon: 'twitter-x-line' as const, url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: 'Facebook', icon: 'facebook-line' as const, url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'LinkedIn', icon: 'linkedin-line' as const, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: 'Reddit', icon: 'reddit-line' as const, url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
    { label: 'Telegram', icon: 'telegram-2-line' as const, url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` }
  ]

  return (
    <div class="flex items-center flex-col gap-2" data-share-root data-url={url} data-title={title}>
      <Button variant="outline" size="sm" data-share-native hidden>
        <Icon name="share-line" class="h-4 w-4 mr-2" />
        Share
      </Button>
      <div class="flex items-center flex-col gap-2" data-share-fallback>
      <span class="text-sm text-muted-foreground">Share:</span>
      <div class="flex gap-2 justify-center flex-wrap">
        {links.map((link) => (
          <ButtonLink
            variant="outline"
            size="icon"
            class="h-8 w-8 bg-transparent"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.label}`}
          >
            <Icon name={link.icon} class="h-4 w-4" />
          </ButtonLink>
        ))}
      </div>
      </div>
    </div>
  )
}
