import { MinecraftText } from '@/components/minecraft-text'
import { potds } from './potd-data'
import { getRandomPhrase } from './potd-fn'

export function POTD() {
    const randomText = getRandomPhrase(potds)
    return <MinecraftText text={randomText} />
}
