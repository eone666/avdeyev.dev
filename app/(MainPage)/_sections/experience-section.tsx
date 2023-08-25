import Timeline from "@/app/(MainPage)/_components/timeline";
import Section from "@/app/(MainPage)/_components/section";
import Skills from "@/app/(MainPage)/_components/skills";
import H2 from "@/components/ui/h2";

export default function ExperienceSection() {
  return (
    <Section className="flex flex-col gap-6 pt-2 sm:flex-row sm:items-center sm:justify-around sm:gap-10">
      <div className="shrink-0">
        <H2 className="mb-4">Work experience</H2>
        <Timeline />
      </div>
      <div className="max-w-[400px]">
        <H2 className="mb-4">Skills</H2>
        <Skills />
      </div>
    </Section>
  );
}
