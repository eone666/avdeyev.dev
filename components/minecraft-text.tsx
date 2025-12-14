import { cn } from "@/lib/utils"
import { Pixelify_Sans } from "next/font/google"

const pixelifySans = Pixelify_Sans({ subsets: ["latin"] })

export type MinecraftTextProps = {
    text: string
}

export function MinecraftText({ text }: MinecraftTextProps) {
    return <span className={cn("inline-flex text-primary animate-mc-wobble", pixelifySans.className)}>
        {text.split('').map((char, i) => (
            <span
                key={i}
                className="inline-block animate-mc-float"
                style={{ animationDelay: `${i * 0.05}s` }}
            >
                {char === ' ' ? '\u00A0' : char}
            </span>
        ))}
    </span>
};