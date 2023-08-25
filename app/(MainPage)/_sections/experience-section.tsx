import Timeline from "@/app/(MainPage)/_components/timeline";
import Section from "@/app/(MainPage)/_components/section";
import Stack from "@/app/(MainPage)/_components/stack";
import H2 from "@/components/ui/h2";

export default function ExperienceSection() {
  return (
    <Section className="flex flex-col gap-6 pt-2 sm:flex-row sm:items-center sm:justify-around sm:gap-8">
      <div>
        <H2 className="mb-4">Work experience</H2>
        <Timeline />
      </div>
      <div>
        <H2 className="mb-4">Main stack</H2>
        <Stack />
      </div>
    </Section>
  );
}
