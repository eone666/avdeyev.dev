import { useState, useEffect } from 'hono/jsx'
import { Button, ButtonLink } from '@/components/ui/button'
import { Icon } from '@/components/icon'

interface SocialShareProps {
    url?: string
    title?: string
    text?: string
    class?: string
}

export default function SocialShare({ url, title = "Check this out!", text = "", class: className = "" }: SocialShareProps) {
    const [isWebShareSupported, setIsWebShareSupported] = useState(false)
    const [showFallback, setShowFallback] = useState(false)

    const [urlToShare, setUrlToShare] = useState(url ?? "")

    useEffect(() => {
        const shareUrl = url ?? window.location.href
        setUrlToShare(shareUrl)
        setIsWebShareSupported(
            typeof navigator.share === 'function' &&
            (typeof navigator.canShare !== 'function' || navigator.canShare({ title, text, url: shareUrl }))
        )
    }, [url, title, text])

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title,
                text,
                url: urlToShare,
            })
        } catch (error) {
            if ((error as Error).name !== "AbortError") {
                setShowFallback(true)
            }
        }
    }

    const socialLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(urlToShare)}&text=${encodeURIComponent(title)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlToShare)}`,
        reddit: `https://reddit.com/submit?url=${encodeURIComponent(urlToShare)}&title=${encodeURIComponent(title)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(urlToShare)}&text=${encodeURIComponent(title)}`

    }

    if (isWebShareSupported && !showFallback) {
        return (
            <Button onClick={handleNativeShare} variant="outline" size="sm" class={className}>
                <Icon name="share-line" class="h-4 w-4 mr-2" />
                Share
            </Button>
        )
    }

    return (
        <div class={`flex items-center flex-col gap-2 ${className}`}>
            <span class="text-sm text-muted-foreground mr-1">Share:</span>

            <div class="flex gap-2 justify-center align-center flex-wrap">
                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on X (Twitter)">
                    <Icon name="twitter-x-line" class="h-4 w-4" />
                </ButtonLink>

                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                    <Icon name="facebook-line" class="h-4 w-4" />
                </ButtonLink>

                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                    <Icon name="linkedin-line" class="h-4 w-4" />
                </ButtonLink>

                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.reddit} target="_blank" rel="noopener noreferrer" aria-label="Share on Reddit">
                    <Icon name="reddit-line" class="h-4 w-4" />
                </ButtonLink>

                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram">
                    <Icon name="telegram-2-line" class="h-4 w-4" />
                </ButtonLink>
            </div>
        </div>
    )
}
