import { ActionLink } from '../action-link'
import { AsciiWordmark } from '../ascii-wordmark'
import { TerminalLayout } from '../terminal-layout'

export type ErrorPageProps = { code: string; title: string; description: string }

export function ErrorPage({ code, title, description }: ErrorPageProps) {
  return <TerminalLayout layout="error">
    <a href="/">avdeyev<span>.dev</span></a>
    <AsciiWordmark text={code} size="error" />
    <h1 class="my-3 text-lg font-medium">{code}: {title}</h1>
    <p class="my-3 text-muted">{description}</p>
    <div class="my-6 flex"><ActionLink href="/" returnLink>Back to home</ActionLink></div>
  </TerminalLayout>
}
