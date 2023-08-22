import MainSection from "@/app/(MainPage)/_sections/main-section";
import ExperienceSection from "@/app/(MainPage)/_sections/experience-section";

export default async function Page() {
  return (
    <div className="h-screen-no-h snap-y snap-mandatory overflow-y-scroll">
      <MainSection />
      <ExperienceSection />
    </div>
  );
}
