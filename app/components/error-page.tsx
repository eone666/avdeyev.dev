import { NavigationCursor } from './navigation-cursor'
import { asciiWordmark } from '@/lib/terminal'

export type ErrorPageProps = { code: string; title: string; description: string }

export function ErrorPage({ code, title, description }: ErrorPageProps) {
  return (
    <main class="screen error-screen">
      <a class="host" href="/">avdeyev<span>.dev</span></a>
      <pre class="wordmark" aria-hidden="true">{asciiWordmark(code)}</pre>
      <h1>{code}: {title}</h1>
      <p>{description}</p>
      <a class="back-home nav-choice" href="/"><NavigationCursor /><span class="back-home-label">Back to home</span></a>
    </main>
  )
}
