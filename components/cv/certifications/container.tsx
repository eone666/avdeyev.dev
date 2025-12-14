import { PropsWithChildren } from "react";
import { RiAwardLine } from 'react-icons/ri';

export async function CertificationsContainer({ children }: PropsWithChildren) {
    return <section>
        <h2 className="text-xl font-bold text-black mb-5 flex items-center gap-3">
            <RiAwardLine className="w-5 h-5" />
            Certifications
        </h2>

        <div className="space-y-3">
            {children}
        </div>
    </section>
}