import { PageFrame } from './page-frame'
import { Header } from './header'
import { Summary } from './summary'
import { WorkXPContainer, WorkXPItem } from './work-xp'
import { EducationContainer, EducationItem } from './education'
import { PageNumber } from './page-number'
import { SkillsBlock, SkillsContainer } from './skills'
import { Languages } from './languages'

export function CVContent() {
  return (
    <div class="flex flex-col gap-4 print:gap-0 use-mm">
      {/* Page 1 */}
      <PageFrame>
        <Header name="Ivan Avdeyev" email="contact@avdeyev.dev" label="Frontend Developer" url="https://avdeyev.dev" location={{ city: "Almaty", countryCode: "KZ" }} />

        <Summary>
          Frontend developer, mostly React and Next.js. Most of the work has been rebuilding what outgrew its first design: a legacy JavaScript codebase migrated to TypeScript, a shared component library, complex data visualizations.
        </Summary>

        <WorkXPContainer>
          <WorkXPItem position="Frontend Developer" company="Raison Securities Ltd" startDate="Feb 2024" endDate="Present" location={{
            city: "Almaty",
            countryCode: "KZ"
          }}
            highlights={[
              "Maintained mobile app features, improving reliability and user experience.",
              "Rebuilt the company website to improve performance and SEO metrics.",
              "Built a scalable and reusable UI component library."
            ]} />
          <WorkXPItem position="Frontend Developer" company="Tile.Expert Ltd" startDate="Jul 2022" endDate="Aug 2023" location={{
            label: "Remote"
          }}
            highlights={[
              "Rebuilt legacy functionality from scratch using Next.js, delivering more maintainable and performant solutions.",
              "Built reusable, well-documented UI components using Storybook.",
              "Contributed to project architecture and core infrastructure decisions."
            ]} />
          <WorkXPItem position="Frontend Developer" company="LLC Rating" startDate="Sep 2020" endDate="Jul 2022" location={{
            city: "Oskemen",
            countryCode: "KZ"
          }}
            highlights={[
              "Developed and maintained React-based web applications used in production.",
              "Refactored a legacy JavaScript codebase to TypeScript, improving type safety and performance.",
              "Used SQL for data collection, analysis, and preparation for frontend visualization.",
              "Implemented complex data visualizations, including charts, maps, and tables."
            ]} />
        </WorkXPContainer>

        <PageNumber>1</PageNumber>
      </PageFrame>

      {/* Page 2 */}
      <PageFrame>

        <section>
          <WorkXPItem position="HTML Coder" company="LLC Megagroup IT" startDate="Apr 2019" endDate="May 2020" location={{
            city: "Oskemen",
            countryCode: "KZ"
          }}
            highlights={[
              "Created responsive, cross-browser, and semantic layouts for client websites.",
              "Integrated frontend layouts with CMS platforms and template engines.",
              "Integrated third-party scripts, widgets, and analytics to enhance functionality and track user behavior.",
            ]} />
        </section>

        <EducationContainer>
          <EducationItem
            institution="Eastern Technical and Humanities College"
            location={{ city: "Oskemen", countryCode: "KZ" }}
            area="1305000 - Information Systems"
            courses={["1305023 - Software Technician", "1305011 - Designer"]}
            studyType="Vocational" startDate="2016" endDate="2020" />
        </EducationContainer>

        <SkillsContainer>
          <SkillsBlock title="Languages" skills={["JavaScript", "TypeScript", "HTML", "CSS", "SCSS", "SQL", "GraphQL"]} />
          <SkillsBlock title="Frameworks & Libraries" skills={["React", "Next.js", "Tailwind", "Astro", "Vue", "Nuxt", "TanStack Query", "SWR", "Redux", "Redux Thunk", "Redux Saga", "Zod", "tRPC"]} />
          <SkillsBlock title="Tools & Platforms" skills={["Storybook", "Git", "Vitest", "Node.js", "PostgreSQL", "Docker", "Linux", "Vite"]} />
          <SkillsBlock title="Concepts" skills={["REST APIs", "Agile", "Scrum", "CI/CD", "Software Design Principles", "SEO"]} />
        </SkillsContainer>

        <Languages langs={[["Russian", "Native"], ["English", "Intermediate"]]} />

        <PageNumber>2</PageNumber>
      </PageFrame >
    </div >
  )
}
