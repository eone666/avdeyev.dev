// U+00A0 non-breaking space, keeps spaces in the phrase from collapsing
const NBSP = String.fromCharCode(0xa0)

export type MinecraftTextProps = {
    text: string
}

export function MinecraftText({ text }: MinecraftTextProps) {
    return <span class="inline-flex text-primary animate-mc-wobble font-pixel">
        {text.split('').map((char, i) => (
            <span
                key={i}
                class="inline-block animate-mc-float"
                style={{ animationDelay: `${i * 0.05}s` }}
            >
                {char === ' ' ? NBSP : char}
            </span>
        ))}
    </span>
};
