import { MainSection } from "@/entities/main-section";
import { ExperienceSection } from "@/entities/experience-section";
import { AboutSection } from "@/entities/about-section";

export default async function Page() {
  return (
    <div className="min-h-screen-wo-hf">
      <MainSection />
      <AboutSection />
      <ExperienceSection />
    </div>
  );
}
