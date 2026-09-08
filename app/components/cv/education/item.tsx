import { sortLocation, type Location } from '@/lib/utils'

export type EducationItemProps = {
    institution: string;
    courses: string[];
    area: string;
    startDate: string;
    endDate: string;
    location: Location;
    studyType: string;
}

export function EducationItem({ area, courses, startDate, endDate, institution, location, studyType }: EducationItemProps) {
    const locationArray = Object.values(sortLocation(location ?? {}))

    return <div class="bg-white border-l-2 border-black pl-6 pr-4 py-5">
        <div class="flex items-start justify-between mb-2 flex-wrap gap-2">
            <div>
                <h3 class="text-lg font-bold text-black">{area}</h3>
                <p class="text-sm text-gray-700 font-medium">{institution}{!!locationArray.length && ` · ${locationArray.join(', ')}`}</p>
            </div>
            <span class="text-sm font-semibold text-black border border-black px-3 py-1 whitespace-nowrap">
                {startDate}–{endDate}
            </span>
        </div>
        <p class="text-sm text-black">
            {studyType} · {courses.join(', ')}
        </p>
    </div>
}
