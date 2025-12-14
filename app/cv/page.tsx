
import { CVContent } from "@/components/cv/content"
import { DownloadButton } from "@/components/cv/download-button"
import { ScalableBlock } from "@/components/cv/scalable-block"
import { Button } from "@/components/ui/button"
import { Viewport, Metadata } from 'next'
import Link from "next/link"
import { RiArrowLeftLine } from "react-icons/ri"

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
      <div className="p-3 border-b border-primary flex justify-between items-center gap-4">
        <Button variant="link" asChild>
          <Link href='/'><RiArrowLeftLine /> Home</Link>
        </Button>
        <DownloadButton />
      </div>
      <ScalableBlock>
        <main className="py-8 print:p-0 flex">
          <CVContent />
        </main>
      </ScalableBlock>
    </div>
  )
}
