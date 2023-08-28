import Link from "next/link";
import dayjs from "dayjs";
import { ExternalLink } from "lucide-react";

export interface TimelineItemProps {
  name: string;
  website: string;
  position: string;
  dates: [string, string | "present"];
}

/**
 *
 * @param name Company name
 * @param website Company website
 * @param position Position in the company
 * @param dates Dates (format: MM/YYYY or "present")
 * @example
 * <TimelineItem
 *   name="Tile.Expert"
 *   website="https://tile.expert/"
 *   position="Frontend Developer"
 *   dates={["07/2022", "08/2023"]}
 * />
 */
export default function TimelineItem({
  name,
  website,
  position,
  dates,
}: TimelineItemProps) {
  const [startDateString, endDateString] = dates;
  const [startMonth, startYear] = startDateString.split("/");
  const [endMonth, endYear] = endDateString.split("/");
  const startDate = dayjs(`${startYear}/${startMonth}/01`);
  const endDate =
    endDateString === "present"
      ? dayjs()
      : dayjs(`${endYear}/${endMonth}/01`).endOf("month");

  const diff = endDate.diff(startDate);
  const duration = dayjs.duration(diff).humanize();

  return (
    <li>
      <Link
        href={website}
        target="_blank"
        className="flex items-center gap-1 text-sm xs:text-base"
      >
        {name} <ExternalLink size="14px" />
      </Link>
      <div className="text-sm xs:text-base">{position}</div>
      <div className="text-sm xs:text-base">
        {startDate.format("MMM YYYY")} -{" "}
        {endDateString === "present"
          ? "Present day"
          : endDate.format("MMM YYYY")}
      </div>
      <div className="text-sm xs:text-base">{duration}</div>
    </li>
  );
}
