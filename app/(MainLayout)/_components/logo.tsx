import Link from "next/link";
import Typewriter from "@/components/ui/typewriter";

export default function Logo() {
  return (
    <Link href="/" className="font-overpass-mono text-xl sm:text-2xl">
      <Typewriter text="AVDEYEV.DEV" delay={100} />
      <span className="animate-ping">_</span>
    </Link>
  );
}
