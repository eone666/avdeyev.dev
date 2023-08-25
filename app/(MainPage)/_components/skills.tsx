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
        <Link
          href="https://www.typescriptlang.org/"
          target="_blank"
          title="Typescript"
        >
          <Icon>
            <SiTypescript />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://react.dev/" target="_blank" title="React">
          <Icon>
            <SiReact />
          </Icon>
        </Link>
      </li>
      <li>
        <Link
          href="https://tailwindcss.com/"
          target="_blank"
          title="Tailwind CSS"
        >
          <Icon>
            <SiTailwindcss />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://redux.js.org/" target="_blank" title="Redux">
          <Icon>
            <SiRedux />
          </Icon>
        </Link>
      </li>
      <li>
        <Link
          href="https://redux-saga.js.org/"
          target="_blank"
          title="Redux Saga"
        >
          <Icon>
            <SiReduxsaga />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://nodejs.org/" target="_blank" title="Node.js">
          <Icon>
            <SiNodedotjs />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://nextjs.org/" target="_blank" title="Next.js">
          <Icon>
            <SiNextdotjs />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://expressjs.com/" target="_blank" title="Express">
          <Icon>
            <SiExpress />
          </Icon>
        </Link>
      </li>
      <li>
        <Link
          href="https://www.postgresql.org/"
          target="_blank"
          title="PostgreSQL"
        >
          <Icon>
            <SiPostgresql />
          </Icon>
        </Link>
      </li>
      <li>
        <Link href="https://www.mongodb.com/" target="_blank" title="MongoDB">
          <Icon>
            <SiMongodb />
          </Icon>
        </Link>
      </li>
    </ul>
  );
}
