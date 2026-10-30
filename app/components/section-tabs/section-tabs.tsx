import { focusRing } from '@/lib/focus-ring'

export type SectionTab = { id: string; label: string }
export type SectionTabsProps = { tabs: readonly SectionTab[] }

export function SectionTabs({ tabs }: SectionTabsProps) {
  return <>
    <div class="tab-hint mb-2 text-center text-ui-sm text-muted mobile:hidden" aria-hidden="true">← → / H L · switch tabs</div>
    <div class="section-tabs mb-8 flex items-center gap-3 text-xs before:h-px before:flex-1 before:bg-line before:content-[''] after:h-px after:flex-1 after:bg-line after:content-[''] mobile:mb-7 mobile:gap-2" role="tablist" aria-label="Site sections">
      {tabs.map((tab, index) => <button
        class={`cursor-pointer bg-transparent px-2 py-1 whitespace-nowrap text-muted aria-selected:text-primary hover:text-primary mobile:min-h-11 mobile:px-1 mobile:py-3 mobile:text-xs ${focusRing}`}
        type="button" role="tab" id={`tab-${tab.id}`}
        aria-controls={`section-${tab.id}`} aria-selected={index === 0 ? 'true' : 'false'}
        tabindex={index === 0 ? 0 : -1} data-tab={tab.id}
      ><span aria-hidden="true">[ </span>{tab.label}<span aria-hidden="true"> ]</span></button>)}
    </div>
  </>
}
