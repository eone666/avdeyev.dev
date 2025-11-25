"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RiShareLine, RiTwitterXLine, RiLinkedinLine, RiRedditLine, RiFacebookLine, RiTelegram2Line } from "react-icons/ri"

interface SocialShareProps {
    url?: string
    title?: string
    text?: string
    className?: string
}

export function SocialShare({ url, title = "Check this out!", text = "", className = "" }: SocialShareProps) {
    const [isWebShareSupported, setIsWebShareSupported] = useState(false)
    const [showFallback, setShowFallback] = useState(false)

    const [urlToShare, setUrlToShare] = useState("")

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUrlToShare(window.location.href)
            setIsWebShareSupported(typeof navigator.share === 'function' ? navigator.canShare() : false)
        }
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
            <Button onClick={handleNativeShare} variant="outline" size="sm" className={className}>
                <RiShareLine className="h-4 w-4 mr-2" />
                Share
            </Button>
        )
    }

    return (
        <div className={`flex items-center flex-col gap-2 ${className}`}>
            <span className="text-sm text-muted-foreground mr-1">Share:</span>

            <div className="flex gap-2 justify-center align-center flex-wrap">
                <Button asChild variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on X (Twitter)">
                        <RiTwitterXLine className="h-4 w-4" />
                    </a>
                </Button>

                <Button asChild variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                        <RiFacebookLine className="h-4 w-4" />
                    </a>
                </Button>

                <Button asChild variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                        <RiLinkedinLine className="h-4 w-4" />
                    </a>
                </Button>


                <Button asChild variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <a href={socialLinks.reddit} target="_blank" rel="noopener noreferrer" aria-label="Share on Reddit">
                        <RiRedditLine className="h-4 w-4" />
                    </a>
                </Button>

                <Button asChild variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                    <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram">
                        <RiTelegram2Line className="h-4 w-4" />
                    </a>
                </Button>
            </div>
        </div>
    )
}
