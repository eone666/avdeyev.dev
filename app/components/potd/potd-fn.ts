export function getRandomPhrase<T extends readonly string[]>(
    phrases: T,
    random: () => number = Math.random,
): T[number] {
    return phrases[Math.floor(random() * phrases.length)]
}

// Date-based phrase selection, kept in case we want to restore POTD behavior later.
// export function getPhraseOfTheDay<T extends readonly string[]>(now: Readonly<Date>, phrases: T): T[number] {
//     const utcYear = now.getUTCFullYear();
//     const utcMonth = now.getUTCMonth();
//     const utcDate = now.getUTCDate();
//
//     const start = new Date(Date.UTC(1999, 11, 22));
//
//     const diffDays = Math.floor(
//         (Date.UTC(utcYear, utcMonth, utcDate) - start.getTime()) / (1000 * 60 * 60 * 24)
//     );
//
//     const shuffledIndex = (diffDays * 7) % phrases.length;
//
//     return phrases[shuffledIndex];
// }
