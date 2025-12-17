import { potds } from "./potd-data";
import { MinecraftText } from "@/components/minecraft-text";
import { getPhraseOfTheDay } from "./potd-fn";

export async function POTD() {
    const dailyText = getPhraseOfTheDay(new Date(), potds)
    return <MinecraftText text={dailyText} />

}