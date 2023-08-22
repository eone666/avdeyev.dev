import TimelineItem, {
  TimelineItemProps,
} from "@/app/(MainPage)/_components/timeline-item";
import TimelineBullet from "@/app/(MainPage)/_components/timeline-bullet";

const timelineData: TimelineItemProps[] = [
  {
    name: "Tile.Expert",
    website: "https://tile.expert/",
    position: "Frontend Developer",
    dates: ["07/2022", "08/2023"],
  },
  {
    name: "Rating.kz",
    website: "https://rating.kz/",
    position: "Frontend Developer",
    dates: ["09/2020", "07/2022"],
  },
  {
    name: "MegaGroup.kz",
    website: "https://megagroup.kz/",
    position: "HTML Coder",
    dates: ["04/2019", "05/2020"],
  },
];

export default function Timeline() {
  return (
    <div className="relative flex gap-5">
      <div className="absolute left-[6px] h-full w-1 bg-primary" />
      <div className="relative flex flex-col justify-around">
        {timelineData.map((item, index) => (
          <TimelineBullet key={index} present={item.dates[1] === "present"} />
        ))}
      </div>
      <ul className="flex flex-col gap-4">
        {timelineData.map((item, index) => (
          <TimelineItem key={index} {...item} />
        ))}
      </ul>
    </div>
  );
}
