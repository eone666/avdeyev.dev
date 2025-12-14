export type SkillsBlockProps = {
    title: string;
    skills: string[]
}

export async function SkillsBlock({ title, skills }: SkillsBlockProps) {
    return <div className="bg-white p-4 border-2 border-black">
        <h3 className="text-sm font-bold text-black mb-3">{title}</h3>
        <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
                <span
                    key={skill}
                    className="text-xs font-medium text-black px-2.5 py-1 border border-gray-300"
                >
                    {skill}
                </span>
            ))}
        </div>
    </div>
}