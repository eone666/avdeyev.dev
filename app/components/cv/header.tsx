import { QRCode } from '@/components/qr-code'
import { RiMailLine, RiMapPinLine, RiLink } from '@/components/icons'
import { type Location, sortLocation } from '@/lib/utils'

export type HeaderProps = {
    name: string;
    label: string;
    email: string;
    url: string;
    location?: Location;
}

export function Header({ name, label, email, url, location }: HeaderProps) {
    const locationArray = Object.values(sortLocation(location ?? {}))
    const locationString = locationArray.join(', ')

    const hostname = new URL(url).hostname

    return <section>
        <div class="flex items-start justify-between gap-6 flex-wrap">
            <div class="flex-1">
                <h1 class="text-4xl font-bold text-black mb-3 text-balance">{name}</h1>
                <p class="text-xl text-gray-700 mb-6 font-medium">{label}</p>

                <div class="flex flex-wrap gap-x-6 gap-y-3">
                    <a href={`mailto:${email}`} class="flex items-center gap-2 text-sm text-black">
                        <RiMailLine class="w-4 h-4" />
                        <span>{email}</span>
                    </a>
                    <a href={url} class="flex items-center gap-2 text-sm text-black" target="_blank">
                        <RiLink class="w-4 h-4" />
                        <span>{hostname}</span>
                    </a>
                    {!!locationArray.length && <a href={`https://www.google.com/maps/search/?api=1&query=${locationString}`} class="flex items-center gap-2 text-sm text-black" target="_blank">
                        <RiMapPinLine class="w-4 h-4" />
                        <span>{locationString}</span>
                    </a>}
                </div>
            </div>

            <div class="flex flex-col items-center gap-2">
                <div class="bg-white p-3 border-2 border-black">
                    <QRCode value={url} size={90} level="H" />
                </div>
            </div>
        </div>
    </section>
}
