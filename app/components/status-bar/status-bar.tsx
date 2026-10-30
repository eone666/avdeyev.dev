import { ActionButton } from '../action-button'

export function StatusBar() {
  return <footer class="terminal-footer relative z-3 pb-4 mobile:hidden">
    <p id="description" class="status-description m-0 mb-3 min-h-4 px-3 text-xs text-muted" aria-live="polite">Source code, experiments, and things built out of curiosity.</p>
    <div class="statusbar flex items-stretch bg-line text-xs text-foreground" aria-label="Navigation and actions">
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 py-2 [&>span]:whitespace-nowrap">
        <span><kbd class="mr-1 bg-foreground px-1 text-background">←→</kbd><kbd class="mr-1 bg-foreground px-1 text-background">H L</kbd> tabs</span>
        <span><kbd class="mr-1 bg-foreground px-1 text-background">↑↓</kbd><kbd class="mr-1 bg-foreground px-1 text-background">J K</kbd> select</span>
        <span><kbd class="mr-1 bg-foreground px-1 text-background">Enter</kbd> open</span>
      </div>
      <div class="ml-auto flex shrink-0 items-center gap-5 px-3 py-2">
        <ActionButton id="copy-email" compact><kbd class="mr-1 bg-foreground px-1 text-background">C</kbd> Copy email</ActionButton>
        <ActionButton id="show-help" compact><kbd class="mr-1 bg-foreground px-1 text-background">?</kbd> Help</ActionButton>
      </div>
    </div>
  </footer>
}
