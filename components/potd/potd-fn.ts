export function getPhraseOfTheDay<T extends readonly string[]>(now: Readonly<Date>, phrases: T): T[number] {
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();

    const start = new Date(Date.UTC(1999, 11, 22));

    const diffDays = Math.floor(
        (Date.UTC(utcYear, utcMonth, utcDate) - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const shuffledIndex = (diffDays * 7) % phrases.length;

    return phrases[shuffledIndex];
}