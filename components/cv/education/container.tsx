import { PropsWithChildren } from "react";
import { RiGraduationCapLine } from 'react-icons/ri';

export async function EducationContainer({ children }: PropsWithChildren) {
    return <section>
        <h2 className="text-xl font-bold text-black mb-5 flex items-center gap-3">
            <RiGraduationCapLine className="w-5 h-5" />
            Education
        </h2>

        <div className="space-y-4">
            {children}
        </div>
    </section>
}