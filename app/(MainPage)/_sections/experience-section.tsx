import Timeline from "@/app/(MainPage)/_components/timeline";
import Section from "@/app/(MainPage)/_components/section";

export default function ExperienceSection() {
  return (
    <Section className="flex flex-col justify-center gap-3">
      <h2 className="text-xl sm:text-2xl">Work experience</h2>
      <Timeline />
    </Section>
  );
}
