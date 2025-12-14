import { PropsWithChildren } from 'react'
import { RiUser3Line } from 'react-icons/ri'

export async function Summary({ children }: PropsWithChildren) {
    return <section>
        <h2 className="flex items-center gap-3 mb-5 text-xl font-bold text-black">
            <RiUser3Line className="w-5 h-5" />
            Professional Summary
        </h2>
        <p className="text-sm text-black leading-relaxed">
            {children}
        </p>
    </section>
}