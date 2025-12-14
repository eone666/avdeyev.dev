import { sortLocation, Location } from "@/lib/utils";

export type WorkXPItemProps = {
    position: string;
    company: string;
    location: Location;
    startDate: string;
    endDate: string;
    highlights: string[];
}

export async function WorkXPItem({ position, company, location, startDate, endDate, highlights }: WorkXPItemProps) {
    const locationArray = Object.values(sortLocation(location ?? {}))

    return <div className="border-l-2 border-black pl-6 pr-4 py-4 bg-white">
        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
            <div>
                <h3 className="text-lg font-bold text-black">{position}</h3>
                <p className="text-sm text-gray-700 font-medium">{company}{!!locationArray.length && ` · ${locationArray.join(', ')}`}</p>
            </div>
            <span className="text-sm font-semibold text-black border border-black px-3 py-1 whitespace-nowrap">
                {startDate} - {endDate}
            </span>
        </div>
        {!!highlights.length && <ul className="space-y-2 text-sm text-black">
            {highlights.map((highlight, index) => <li key={index} className="flex gap-2">
                <span className="text-black mt-1">•</span>
                <span>{highlight}</span>
            </li>)}
        </ul>}

    </div>
}