import { ActionLink } from './action-link'
import { BodyText } from './body-text'
import { TerminalLayout } from './terminal-layout'
import { focusRing } from '@/lib/focus-ring'

export function NoJsPage() {
  return <TerminalLayout layout="fallback">
    <div class="w-full max-w-130">
      <p class="m-0 mb-12 text-xs text-primary">root@avdeyev.dev:~ #</p>
      <p class="my-3 inline-block bg-primary px-3 py-1 text-xs text-background">[ JavaScript disabled ]</p>
      <h1 class="my-5 text-[clamp(22px,5vw,32px)] leading-snug font-medium">The terminal is offline.</h1>
      <BodyText>This interactive site needs JavaScript. You can still find me here:</BodyText>
      <nav class="my-7 grid gap-2" aria-label="Contact and CV">
        <ActionLink href="/cv.pdf" layout="row">Read my CV</ActionLink>
        <ActionLink href="https://github.com/eone666" layout="row">GitHub</ActionLink>
        <ActionLink href="mailto:contact@avdeyev.dev" layout="row">contact@avdeyev.dev</ActionLink>
      </nav>
      <BodyText>Enable JavaScript and <a href="/" class={`text-primary underline underline-offset-2 ${focusRing}`}>reload the site</a> to explore.</BodyText>
    </div>
  </TerminalLayout>
}
