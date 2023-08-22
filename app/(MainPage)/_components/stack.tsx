import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
} from "@icons-pack/react-simple-icons";
import Link from "next/link";
import Icon from "@/app/(MainPage)/_components/icon";

export default function Stack() {
  return (
    <ul className="flex gap-3 text-2xl">
      <li>
        <Link href="#">
          <Icon>
            <SiTypescript />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="#">
          <Icon>
            <SiReact />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="#">
          <Icon>
            <SiNextdotjs />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="#">
          <Icon>
            <SiTailwindcss />
          </Icon>
        </Link>
      </li>
    </ul>
  );
}
