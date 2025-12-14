import { Fragment, PropsWithChildren } from "react";
import { RiGlobalLine } from "react-icons/ri";

export type LanguagesProps = {
    langs: [string, string][]
}

export async function Languages({ langs }: LanguagesProps) {
    return <section>
        <h2 className="text-xl font-bold text-black flex items-center gap-3 mb-5">
            <RiGlobalLine className="size-5" />
            Languages
        </h2>

        <div className="flex gap-5 text-black text-sm border-l-2 border-black pl-6 pr-4 py-4">
            {langs.map(([name, level], index) => <Fragment key={index}><div>{name} - {level}</div>{index < langs.length - 1 && <div> · </div>}</Fragment>)}
        </div>
    </section>
}