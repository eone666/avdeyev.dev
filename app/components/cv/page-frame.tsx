import type { PropsWithChildren } from 'hono/jsx'
import { cn } from '@/lib/utils'

export function PageFrame({ children }: PropsWithChildren) {

    return <div class={cn([
        "flex flex-col gap-6 relative",
        "cv-page bg-white shadow-lg mx-auto p-12 w-full w-[210mm] h-[297mm] overflow-hidden",
        "print:shadow-none"
    ])}
        data-type="page">
        {children}
    </div>
}
