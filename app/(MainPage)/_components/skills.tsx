import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiRedux,
  SiReduxsaga,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiPostgresql,
} from "@icons-pack/react-simple-icons";
import Link from "next/link";
import Icon from "@/app/(MainPage)/_components/icon";

export default function Skills() {
  return (
    <ul className="flex flex-wrap gap-3 text-2xl">
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
        <Link href="https://tailwindcss.com/" target="_blank">
          <Icon>
            <SiTailwindcss />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://redux.js.org/" target="_blank">
          <Icon>
            <SiRedux />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://redux-saga.js.org/" target="_blank">
          <Icon>
            <SiReduxsaga />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://nodejs.org/" target="_blank">
          <Icon>
            <SiNodedotjs />
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
        <Link href="https://expressjs.com/" target="_blank">
          <Icon>
            <SiExpress />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://www.postgresql.org/" target="_blank">
          <Icon>
            <SiPostgresql />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://www.mongodb.com/" target="_blank">
          <Icon>
            <SiMongodb />
          </Icon>
        </Link>
      </li>
    </ul>
  );
}
