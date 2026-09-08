import type { PropsWithChildren } from 'hono/jsx'
import { RiBriefcase2Line } from '@/components/icons'

export function WorkXPContainer({ children }: PropsWithChildren) {
    return <section>
        <h2 class="text-xl font-bold text-black mb-5 flex items-center gap-3">
            <RiBriefcase2Line class="size-5" />
            Work Experience
        </h2>

        <div class="space-y-4">
            {children}
        </div>
    </section>
}
