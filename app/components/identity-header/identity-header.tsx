import { AsciiWordmark } from '../ascii-wordmark'

export function IdentityHeader() {
  return <section class="identity w-full max-w-180 shrink-0 text-center" aria-labelledby="name">
    <h1 id="name" class="sr-only">Ivan Avdeyev</h1>
    <AsciiWordmark text="AVDEYEV.DEV" />
    <div class="identity-label mt-6 flex justify-center gap-4 text-xs tracking-widest narrow:mt-5 narrow:gap-2 narrow:text-ui-xs narrow:tracking-wide"><span>IVAN AVDEYEV</span><span class="text-line">/</span><span>FRONTEND DEVELOPER</span></div>
    <p class="splash mt-4 text-xs text-muted narrow:text-xs">Frontend ends. Curiosity doesn't.</p>
  </section>
}
