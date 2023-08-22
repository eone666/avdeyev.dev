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
        <Link href="https://www.typescriptlang.org/" target="_blank">
          <Icon>
            <SiTypescript />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://react.dev/" target="_blank">
          <Icon>
            <SiReact />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://nextjs.org/" target="_blank">
          <Icon>
            <SiNextdotjs />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://tailwindcss.com/" target="_blank">
          <Icon>
            <SiTailwindcss />
          </Icon>
        </Link>
      </li>
    </ul>
  );
}
