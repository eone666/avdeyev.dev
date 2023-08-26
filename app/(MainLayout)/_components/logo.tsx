import Link from "next/link";
import Typewriter from "@/components/typewriter";

export default function Logo() {
  return (
    <Link href="/" className="font-overpass-mono text-xl sm:text-2xl">
      <Typewriter text={"IVAN_AVDEYEV"} delay={100} />
      <span className="animate-ping">_</span>
    </Link>
  );
}
