export type SkillListProps = { skills: readonly string[] }

/** Informational terminal labels; deliberately not interactive controls. */
export function SkillList({ skills }: SkillListProps) {
  return <ul class="skill-badges my-6 flex list-none flex-wrap gap-x-4 gap-y-2 p-0" aria-label="Skills">
    {skills.map(skill => <li class="text-xs leading-readable whitespace-nowrap text-primary before:content-['[_'] after:content-['_]']">{skill}</li>)}
  </ul>
}
