import type { PropsWithChildren } from 'hono/jsx'
import { RiCodeLine } from '@/components/icons'

export function SkillsContainer({ children }: PropsWithChildren) {
    return <section>
        <h2 class="text-xl font-bold text-black mb-5 flex items-center gap-3">
            <RiCodeLine class="w-5 h-5" />
            Technical Skills
        </h2>

        <div class="grid grid-cols-2 gap-4">
            {children}
        </div>
    </section>
}
