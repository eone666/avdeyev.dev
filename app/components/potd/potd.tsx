import { MinecraftText } from '@/components/minecraft-text'
import { potds } from './potd-data'
import { getPhraseOfTheDay } from './potd-fn'

export function POTD() {
    const dailyText = getPhraseOfTheDay(new Date(), potds)
    return <MinecraftText text={dailyText} />
}
