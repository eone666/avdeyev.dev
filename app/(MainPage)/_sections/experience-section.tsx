import Timeline from "@/app/(MainPage)/_components/timeline";
import Section from "@/app/(MainPage)/_components/section";
import Stack from "@/app/(MainPage)/_components/stack";

export default function ExperienceSection() {
  return (
    <Section className="flex flex-col gap-6 pt-2 sm:flex-row sm:items-center sm:justify-around sm:gap-8">
      <div>
        <h2 className="mb-4 text-xl sm:text-2xl">Work experience</h2>
        <Timeline />
      </div>
      <div>
        <h2 className="mb-4 text-xl sm:text-2xl">Main stack</h2>
        <Stack />
      </div>
    </Section>
  );
}
