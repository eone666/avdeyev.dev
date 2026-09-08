import { RiDownload2Line } from '@/components/icons'
import { ButtonLink } from '@/components/ui/button'

export function DownloadButton() {
    return <ButtonLink
        variant="default"
        size="lg"
        class="print:hidden"
        href="/cv.pdf"
        download
    >
        <RiDownload2Line class="size-4" />
        Download
    </ButtonLink>
}
