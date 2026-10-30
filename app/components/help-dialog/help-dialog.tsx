import { ActionButton } from '../action-button'

const shortcuts = [
  ['← → / H L', 'Switch tabs'], ['↑ ↓ / J K', 'Select a link'],
  ['Enter', 'Open selected link'], ['C', 'Copy email'],
  ['?', 'Open this help'], ['Esc', 'Close help'],
]
export function HelpDialog() {
  return <dialog id="help-dialog" aria-labelledby="help-title" class="m-auto max-h-[85dvh] w-[min(520px,calc(100%_-_32px))] overflow-auto border border-primary bg-background p-6 text-foreground backdrop:bg-black/80">
    <div class="flex items-center justify-between gap-4 max-xs:items-start"><h2 id="help-title" class="m-0 text-sm font-medium text-primary">Keyboard shortcuts</h2><ActionButton id="close-help" label="Close help" appearance="muted"><span class="text-xs">[ Esc ] close</span></ActionButton></div>
    <dl class="mt-5 mb-0">
      {shortcuts.map(([keys, action]) => <div class="grid grid-cols-[130px_1fr] gap-3 py-2 max-xs:grid-cols-[100px_1fr] max-xs:text-xs"><dt class="text-primary">{keys}</dt><dd class="m-0 text-muted">{action}</dd></div>)}
    </dl>
  </dialog>
}
