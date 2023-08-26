import Timeline from "@/app/(MainLayout)/_components/timeline";
import Section from "@/app/(MainLayout)/_components/section";
import Skills from "@/app/(MainLayout)/_components/skills";
import H2 from "@/components/ui/h2";

export default function ExperienceSection() {
  return (
    <Section className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-around sm:gap-6 md:gap-10">
      <div className="shrink-0">
        <H2 className="mb-2 sm:mb-4">Work experience</H2>
        <Timeline />
      </div>
      <div className="max-w-[600px]">
        <H2 className="mb-2 sm:mb-4">Skills</H2>
        <Skills />
      </div>
    </Section>
  );
}
