import Timeline from "@/app/(MainPage)/_components/timeline";
import Section from "@/app/(MainPage)/_components/section";

export default function ExperienceSection() {
  return (
    <Section className="flex flex-col gap-3 pt-2 sm:justify-center">
      <h2 className="text-xl sm:text-2xl">Work experience</h2>
      <Timeline />
    </Section>
  );
}
