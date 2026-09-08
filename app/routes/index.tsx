import { createRoute } from 'honox/factory'
import { ProfileCard } from '@/components/profile-card'
import CloudSky from '@/islands/cloud-sky'
import { randomSeed } from '@/lib/voxel'

export default createRoute((c) =>
  c.render(
    // No bg-background here: body carries it, so the fixed sky shows through.
    <main class="pixel-dither relative min-h-dvh flex items-center justify-center p-4">
      {/* Seeded per request, so every visit gets a different sky and ground. */}
      <CloudSky seed={randomSeed()} />
      <ProfileCard />
    </main>,
    {
      title: 'Ivan Avdeyev | Frontend Developer',
      description: "Ivan Avdeyev's link hub."
    }
  )
)
