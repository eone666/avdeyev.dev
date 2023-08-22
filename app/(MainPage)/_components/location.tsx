import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Location() {
  return (
    <Link
      href="geo:49.958931,82.605774"
      className="text-md flex items-center gap-1 text-center sm:text-xl"
    >
      <MapPin />
      Oskemen, Kazakhstan
    </Link>
  );
}
