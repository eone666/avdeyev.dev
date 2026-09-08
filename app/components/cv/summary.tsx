import type { PropsWithChildren } from 'hono/jsx'
import { RiUser3Line } from '@/components/icons'

export function Summary({ children }: PropsWithChildren) {
    return <section>
        <h2 class="flex items-center gap-3 mb-5 text-xl font-bold text-black">
            <RiUser3Line class="w-5 h-5" />
            Professional Summary
        </h2>
        <p class="text-sm text-black leading-relaxed">
            {children}
        </p>
    </section>
}
