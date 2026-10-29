import { NoJsPage } from './no-js-page'
import { asciiWordmark } from '@/lib/terminal'
import { personalLinks, terminalProjects as projects } from '../../shared/site'

export function TerminalHome() {
  return <>
    <noscript>
      <style>{'.terminal-app { display: none !important }'}</style>
      <NoJsPage />
    </noscript>
    <div class="terminal-app">
    <a class="skip" href="#sections">Skip to sections</a>
    <div class="stars" aria-hidden="true"><span>+</span><span>·</span><span>+</span><span>·</span><span>+</span><span>·</span><span>+</span><span>·</span></div>
    <div class="screen">
      <main>
        <section class="identity" aria-labelledby="name">
          <div class="eyebrow"><span>~/home/eone666</span><span>personal space on the internet</span></div>
          <h1 id="name" class="sr-only">Ivan Avdeyev</h1>
          <pre id="wordmark" class="wordmark" aria-hidden="true">{asciiWordmark('AVDEYEV.DEV')}</pre>
          <div class="identity-label"><span>IVAN AVDEYEV</span><span class="divider">/</span><span>FRONTEND DEVELOPER</span></div>
          <p class="splash" id="splash">Frontend ends. Curiosity doesn't.</p>
        </section>
  
        <div class="sections" id="sections">
          <div class="tab-hint" aria-hidden="true">← → / H L · switch tabs</div>
          <div class="section-tabs" role="tablist" aria-label="Site sections">
            {['Links', 'Projects', 'About'].map((label, index) => <button
              type="button" role="tab" id={`tab-${label.toLowerCase()}`}
              aria-controls={`section-${label.toLowerCase()}`} aria-selected={index === 0 ? 'true' : 'false'}
              tabindex={index === 0 ? 0 : -1} data-tab={label.toLowerCase()}
            ><span aria-hidden="true">[ </span>{label}<span aria-hidden="true"> ]</span></button>)}
          </div>
          <section id="section-links" role="tabpanel" aria-labelledby="tab-links" data-section="links" tabindex={-1}>
        <nav class="menu" id="menu" aria-label="Personal links">
          {personalLinks.map((link, index) => <a
            class="menu-row"
            href={link.url}
            target={link.url.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            data-description={link.description}
            data-selected={index === 0 ? 'true' : 'false'}
          >
            <span class="cursor" aria-hidden="true">›</span>
            <span class="menu-label">{link.label}</span>
            <span class="menu-detail">{link.detail}</span>
            <span class="link-target" aria-hidden="true">{link.url.startsWith('mailto:') ? '✉' : '↗'}</span>
            {!link.url.startsWith('mailto:') && <span class="sr-only"> (opens in a new tab)</span>}
          </a>)}
        </nav>
          </section>
          <section id="section-projects" role="tabpanel" aria-labelledby="tab-projects" data-section="projects" tabindex={-1} hidden>
            {projects.map(project => <a class="project" href={project.url} target="_blank" rel="noopener noreferrer">
              <strong>{project.name}<span class="project-actions"><span aria-hidden="true">↗</span></span></strong>
              <p>{project.description}</p><small>{project.stack}</small>
            </a>)}
          </section>
          <section id="section-about" role="tabpanel" aria-labelledby="tab-about" data-section="about" tabindex={-1} hidden>
            <h2 class="about-head">Hello, I’m Ivan.</h2>
            <p class="about-copy">Frontend developer building web and mobile interfaces, reusable UI systems, and data-rich applications. I work across frameworks and learn the tools a project needs.</p>
            <p class="about-copy">I value maintainable code, thoughtful UX, and understanding how things work under the hood. Sometimes that means UI runtimes. Sometimes it means router firmware or a custom keyboard.</p>
            <div class="token-list">{['React', 'TypeScript', 'Redux', 'Next.js', 'Astro', 'TanStack Query', 'Unit & E2E testing', 'Web performance'].map(skill => <span>{skill}</span>)}</div>
            <a class="project" href="/cv.pdf" target="_blank" rel="noopener noreferrer"><strong>Read the full CV <span class="project-actions"><span aria-hidden="true">↗</span></span></strong></a>
          </section>
        </div>
  
      </main>
  
      <footer class="terminal-footer">
        <p id="description" class="status-description" aria-live="polite">Source code, experiments, and things built out of curiosity.</p>
        <div class="statusbar" aria-label="Navigation and actions">
          <div class="status-navigation">
            <span><kbd>←→</kbd><kbd>H L</kbd> tabs</span>
            <span><kbd>↑↓</kbd><kbd>J K</kbd> select</span>
            <span><kbd>Enter</kbd> open</span>
          </div>
          <div class="status-actions">
            <button id="copy-email" type="button"><kbd>C</kbd> Copy email</button>
            <button id="show-help" type="button"><kbd>?</kbd> Help</button>
          </div>
        </div>
      </footer>
    </div>
  
    <dialog id="help-dialog" aria-labelledby="help-title">
      <div class="help-heading"><h2 id="help-title">Keyboard shortcuts</h2><button type="button" id="close-help" aria-label="Close help">[ Esc ] close</button></div>
      <dl class="help-shortcuts">
        <div><dt>← → / H L</dt><dd>Switch tabs</dd></div>
        <div><dt>↑ ↓ / J K</dt><dd>Select a link</dd></div>
        <div><dt>Enter</dt><dd>Open selected link</dd></div>
        <div><dt>C</dt><dd>Copy email</dd></div>
        <div><dt>?</dt><dd>Open this help</dd></div>
        <div><dt>Esc</dt><dd>Close help</dd></div>
      </dl>
    </dialog>
    <div id="toast" role="status" aria-live="polite" hidden></div>
    </div>
  </>
}
