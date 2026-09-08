import { ButtonLink } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MinecraftText } from '@/components/minecraft-text'
import { RiArrowLeftLine } from '@/components/icons'
import CloudSky from '@/islands/cloud-sky'
import { randomSeed } from '@/lib/voxel'

export type ErrorPageProps = {
    code: string
    title: string
    description: string
}

export function ErrorPage({ code, title, description }: ErrorPageProps) {
    return (
        // Same shell as the home page: no bg-background, so the fixed sky
        // behind it shows through.
        <main class="pixel-dither relative min-h-dvh flex items-center justify-center p-4">
            <CloudSky seed={randomSeed()} />

            <Card class="pixel-panel w-full max-w-md p-8 bg-card border-border">
                <div class="flex flex-col items-center gap-6 text-center">
                    <p class="pixel-mark text-6xl font-bold leading-none">
                        <MinecraftText text={code} />
                    </p>

                    <div class="space-y-1">
                        <h1 class="text-2xl font-bold text-foreground">{title}</h1>
                        <p class="text-muted-foreground">{description}</p>
                    </div>

                    <ButtonLink
                        variant="secondary"
                        class="pixel-btn w-full h-14 group hover:bg-secondary/80 hover:border-primary/50 border border-transparent"
                        href="/"
                    >
                        <RiArrowLeftLine class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span class="font-medium">Back to home</span>
                    </ButtonLink>
                </div>
            </Card>
        </main>
    )
}
