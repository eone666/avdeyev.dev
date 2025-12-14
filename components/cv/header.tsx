import { QRCodeSVG } from 'qrcode.react'
import { RiMailLine, RiPhoneLine, RiMapPinLine, RiLink } from 'react-icons/ri'
import { Location, sortLocation } from '@/lib/utils'


export type HeaderProps = {
    name: string;
    label: string;
    email: string;
    url: string;
    location?: Location;
}

export async function Header({ name, label, email, url, location }: HeaderProps) {
    const locationArray = Object.values(sortLocation(location ?? {}))
    const locationString = locationArray.join(', ')

    const hostname = new URL(url).hostname

    return <section>
        <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1">
                <h1 className="text-4xl font-bold text-black mb-3 text-balance">{name}</h1>
                <p className="text-xl text-gray-700 mb-6 font-medium">{label}</p>

                <div className="flex flex-wrap gap-x-6 gap-y-3">
                    <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-black">
                        <RiMailLine className="w-4 h-4" />
                        <span>{email}</span>
                    </a>
                    <a href={url} className="flex items-center gap-2 text-sm text-black" target="_blank">
                        <RiLink className="w-4 h-4" />
                        <span>{hostname}</span>
                    </a>
                    {!!locationArray.length && <a href={`https://www.google.com/maps/search/?api=1&query=${locationString}`} className="flex items-center gap-2 text-sm text-black" target="_blank">
                        <RiMapPinLine className="w-4 h-4" />
                        <span>{locationString}</span>
                    </a>}
                </div>
            </div>

            <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-3 border-2 border-black">
                    <QRCodeSVG value={url} size={90} level="H" />
                </div>
            </div>
        </div>
    </section>
}