import { potd } from "./potd-data";
import { MinecraftText } from "@/components/minecraft-text";

export function getPhraseOfTheDay(): string {
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDate = now.getUTCDate();

    const start = new Date(Date.UTC(1999, 11, 22));

    const diffDays = Math.floor(
        (Date.UTC(utcYear, utcMonth, utcDate) - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const shuffledIndex = (diffDays * 7) % potd.length;

    return potd[shuffledIndex];
}

export async function POTD() {
    const dailyText = getPhraseOfTheDay()
    return <MinecraftText text={dailyText} />

}