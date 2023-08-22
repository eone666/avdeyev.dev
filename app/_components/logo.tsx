import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="font-overpass-mono text-2xl">
      IVAN_A<span className="hidden sm:inline">VDEYEV</span>
    </Link>
  );
}
