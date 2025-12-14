import { PropsWithChildren } from "react";
import { RiCodeLine } from 'react-icons/ri';

export async function SkillsContainer({ children }: PropsWithChildren) {
    return <section>
        <h2 className="text-xl font-bold text-black mb-5 flex items-center gap-3">
            <RiCodeLine className="w-5 h-5" />
            Technical Skills
        </h2>

        <div className="grid grid-cols-2 gap-4">
            {children}
        </div>
    </section>
}