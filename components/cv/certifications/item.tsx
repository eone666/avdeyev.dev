export type CertificationsItemProps = {
    issuer: string;
    name: string;
    date: string;
}

export async function CertificationsItem({ name, issuer, date }: CertificationsItemProps) {
    return <div className="bg-white p-4 border-l-2 border-black flex items-center justify-between">
        <div>
            <h3 className="text-sm font-bold text-black">{name}</h3>
            <p className="text-xs text-gray-700">{issuer}</p>
        </div>
        <span className="text-xs font-semibold text-black border border-black px-3 py-1 whitespace-nowrap">
            {date}
        </span>
    </div>
}