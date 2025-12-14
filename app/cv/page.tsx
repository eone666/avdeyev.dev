
import { CVContent } from "@/components/cv/content"
import { PrintButton } from "@/components/cv/print-button"
import { ScalableBlock } from "@/components/cv/scalable-block"

export default async function CVPage() {

  return (
    <div className="min-h-screen bg-muted/30">
      <ScalableBlock>
        <main className="container mx-auto px-4 py-8 print:p-0 print:w-full">
          <CVContent />
        </main>
      </ScalableBlock>
      <PrintButton />
    </div>
  )
}
