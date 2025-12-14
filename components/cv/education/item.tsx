import { sortLocation, Location } from "@/lib/utils";

export type EducationItemProps = {
    instutution: string;
    courses: string[];
    area: string;
    startDate: string;
    endDate: string;
    location: Location;
    studyType: string;
}

export async function EducationItem({ area, courses, startDate, endDate, instutution, location, studyType }: EducationItemProps) {
    const locationArray = Object.values(sortLocation(location ?? {}))
    const locationString = locationArray.join(', ')

    return <div className="bg-white border-l-2 border-black pl-6 pr-4 py-5">
        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
            <div>
                <h3 className="text-lg font-bold text-black">{area}</h3>
                <p className="text-sm text-gray-700 font-medium">{instutution}{!!locationArray.length && ` · ${locationArray.join(', ')}`}</p>
            </div>
            <span className="text-sm font-semibold text-black border border-black px-3 py-1 whitespace-nowrap">
                {startDate} - {endDate}
            </span>
        </div>
        <p className="text-sm text-black">
            {studyType} · {courses.join(', ')}
        </p>
    </div>
}