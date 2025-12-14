import { PropsWithChildren } from "react";
import { RiBriefcase2Line } from "react-icons/ri";

export async function WorkXPContainer({ children }: PropsWithChildren) {
    return <section>
        <h2 className="text-xl font-bold text-black mb-5 flex items-center gap-3">
            <RiBriefcase2Line className="size-5" />
            Work Experience
        </h2>

        <div className="space-y-4">
            {children}
        </div>
    </section>
}