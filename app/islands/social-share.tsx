import { useState, useEffect } from 'hono/jsx'
import { Button, ButtonLink } from '@/components/ui/button'
import {
    RiShareLine,
    RiTwitterXLine,
    RiLinkedinLine,
    RiRedditLine,
    RiFacebookLine,
    RiTelegram2Line
} from '@/components/icons'

interface SocialShareProps {
    url?: string
    title?: string
    text?: string
    class?: string
}

export default function SocialShare({ title = "Check this out!", text = "", class: className = "" }: SocialShareProps) {
    const [isWebShareSupported, setIsWebShareSupported] = useState(false)
    const [showFallback, setShowFallback] = useState(false)

    const [urlToShare, setUrlToShare] = useState("")

    useEffect(() => {
        setUrlToShare(window.location.href)
        setIsWebShareSupported(typeof navigator.share === 'function' ? navigator.canShare() : false)
    }, [])

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
                <RiShareLine class="h-4 w-4 mr-2" />
                Share
            </Button>
        )
    }

    return (
        <div class={`flex items-center flex-col gap-2 ${className}`}>
            <span class="text-sm text-muted-foreground mr-1">Share:</span>

            <div class="flex gap-2 justify-center align-center flex-wrap">
                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on X (Twitter)">
                    <RiTwitterXLine class="h-4 w-4" />
                </ButtonLink>

                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                    <RiFacebookLine class="h-4 w-4" />
                </ButtonLink>

                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                    <RiLinkedinLine class="h-4 w-4" />
                </ButtonLink>

                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.reddit} target="_blank" rel="noopener noreferrer" aria-label="Share on Reddit">
                    <RiRedditLine class="h-4 w-4" />
                </ButtonLink>

                <ButtonLink variant="outline" size="icon" class="h-8 w-8 bg-transparent" href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram">
                    <RiTelegram2Line class="h-4 w-4" />
                </ButtonLink>
            </div>
        </div>
    )
}
