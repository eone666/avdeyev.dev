import type { PropsWithChildren } from 'hono/jsx'
import { RiGraduationCapLine } from '@/components/icons'

export function EducationContainer({ children }: PropsWithChildren) {
    return <section>
        <h2 class="text-xl font-bold text-black mb-5 flex items-center gap-3">
            <RiGraduationCapLine class="w-5 h-5" />
            Education
        </h2>

        <div class="space-y-4">
            {children}
        </div>
    </section>
}
