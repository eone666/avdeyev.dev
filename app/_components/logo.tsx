import Link from "next/link";
import Typewriter from "@/components/typewriter";

export default function Logo() {
  return (
    <Link href="/" className="font-overpass-mono text-2xl">
      <Typewriter text={"IVAN_A"} delay={100} className="inline sm:hidden" />
      <Typewriter
        text={"IVAN_AVDEYEV"}
        delay={100}
        className="hidden sm:inline"
      />
      <span className="animate-ping">_</span>
    </Link>
  );
}
