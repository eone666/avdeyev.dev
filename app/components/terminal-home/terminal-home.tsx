import { NavigationItem } from '../navigation-item'
import { SectionTabs } from '../section-tabs'
import { SkillList } from '../skill-list'
import { TerminalCommand } from '../terminal-command'
import { TerminalLayout } from '../terminal-layout'
import { IdentityHeader } from '../identity-header'
import { TerminalStars } from '../terminal-stars'
import { StatusBar } from '../status-bar'
import { HelpDialog } from '../help-dialog'
import { Toast } from '../toast'
import { NoJsPage } from '../no-js-page'
import { focusRing } from '@/lib/focus-ring'
import { BodyText } from '../body-text'
import { personalLinks, terminalProjects as projects } from '../../../shared/site'

export function TerminalHome() {
  return <>
    <noscript>
      <style>{'.terminal-app { display: none !important }'}</style>
      <NoJsPage />
    </noscript>
    <div class="terminal-app">
      <a class={`skip fixed -top-15 left-4 z-10 bg-primary p-2 text-background focus:top-3 ${focusRing}`} href="#sections">Skip to sections</a>
      <TerminalStars />
      <TerminalLayout header={<TerminalCommand />} footer={<StatusBar />}>
        <IdentityHeader />
        <div class="sections relative z-2 mt-8 w-full max-w-170 shrink-0 mobile:mt-7" id="sections">
          <SectionTabs tabs={[
            { id: 'links', label: 'Links' },
            { id: 'projects', label: 'Projects' },
            { id: 'about', label: 'About' },
          ]} />
          <section id="section-links" class="min-h-78 outline-none mobile:min-h-0" role="tabpanel" aria-labelledby="tab-links" data-section="links" tabindex={-1}>
            <nav class="menu mx-auto w-full max-w-110 mobile:max-w-none" id="menu" aria-label="Personal links">
              {personalLinks.map(link => <NavigationItem
                href={link.url} title={link.label} detail={link.detail}
                statusDescription={link.description}
              />)}
            </nav>
          </section>
          <section id="section-projects" class="min-h-78 outline-none mobile:min-h-0" role="tabpanel" aria-labelledby="tab-projects" data-section="projects" tabindex={-1} hidden>
            {projects.map(project => <NavigationItem
              href={project.url} title={project.name}
              description={project.description} meta={project.stack}
            />)}
          </section>
          <section id="section-about" class="min-h-78 outline-none mobile:min-h-0" role="tabpanel" aria-labelledby="tab-about" data-section="about" tabindex={-1} hidden>
            <h2 class="about-head mt-0 mb-3 text-base font-medium">Hello, I’m Ivan.</h2>
            <BodyText>Frontend developer building web and mobile interfaces, reusable UI systems, and data-rich applications. I work across frameworks and learn the tools a project needs.</BodyText>
            <BodyText>I value maintainable code, thoughtful UX, and understanding how things work under the hood. Sometimes that means UI runtimes. Sometimes it means router firmware or a custom keyboard.</BodyText>
            <SkillList skills={['React', 'TypeScript', 'Redux', 'Next.js', 'Astro', 'TanStack Query', 'Unit & E2E testing', 'Web performance']} />
            <NavigationItem href="/cv.pdf" title="Read the full CV" />
          </section>
        </div>
      </TerminalLayout>
      <HelpDialog />
      <Toast />
    </div>
  </>
}
