import MainSection from "@/app/(MainLayout)/_sections/main-section";
import ExperienceSection from "@/app/(MainLayout)/_sections/experience-section";
import AboutMe from "@/app/(MainLayout)/_sections/about-me";

export default async function Page() {
  return (
    <div className="h-screen-wo-hf snap-y snap-mandatory overflow-y-auto">
      <MainSection />
      <AboutMe />
      <ExperienceSection />
    </div>
  );
}
