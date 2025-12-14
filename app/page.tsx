import { ProfileCard } from "@/components/profile-card"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Ivan Avdeyev | Frontend Developer | LinksP',
  description: "Ivan Avdeyev's link hub."
}


export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <ProfileCard />
    </main>
  )
}
