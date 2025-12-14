
import { CVContent } from "@/components/cv/content"
import { DownloadButton } from "@/components/cv/download-button"
import { ScalableBlock } from "@/components/cv/scalable-block"
import { Viewport, Metadata } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export const metadata: Metadata = {
  title: 'Ivan Avdeyev | CV',
  description: "Ivan Avdeyev's CV."
}

export default async function CVPage() {
  return (
    <div className="bg-muted/30">
      <ScalableBlock>
        <main className="py-8 print:p-0 flex">
          <CVContent />
        </main>
      </ScalableBlock>
      <DownloadButton />
    </div>
  )
}
