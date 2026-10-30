/** Shell command and its client-local execution timestamp. */
export function TerminalCommand() {
  return <header class="absolute inset-x-8 top-6 z-3 flex items-baseline justify-between gap-3 text-xs narrow:inset-x-5 narrow:top-4 narrow:text-ui-sm" aria-label="Terminal command">
    <div class="min-w-0 whitespace-nowrap"><span class="text-primary">root@avdeyev.dev:~ #</span>{' '}<span class="text-foreground">./homepage</span></div>
    <time id="command-timestamp" class="shrink-0 text-muted tabular-nums" aria-label="Page opened at local time">--:--:--</time>
  </header>
}
