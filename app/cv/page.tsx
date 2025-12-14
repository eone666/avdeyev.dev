
import { CVContent } from "@/components/cv/content"
import { PrintButton } from "@/components/cv/print-button"
import { ScalableBlock } from "@/components/cv/scalable-block"
import { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}


export default async function CVPage() {
  return (
    <div className="bg-muted/30">
      <ScalableBlock>
        <main className="py-8 print:p-0 flex">
          <CVContent />
        </main>
      </ScalableBlock>
      <PrintButton />
    </div>
  )
}
