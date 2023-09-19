import {
  SiExpress,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiRedux,
  SiReduxsaga,
  SiTailwindcss,
  SiTypescript,
} from "@icons-pack/react-simple-icons";
import { Skill } from "@/shared/types/skill";

export const skills: Skill[] = [
  {
    title: "Typescript",
    link: "https://www.typescriptlang.org/",
    icon: <SiTypescript />,
  },
  {
    title: "React",
    link: "https://react.dev/",
    icon: <SiReact />,
  },
  {
    title: "Tailwind CSS",
    link: "https://tailwindcss.com/",
    icon: <SiTailwindcss />,
  },
  {
    title: "Redux",
    link: "https://redux.js.org/",
    icon: <SiRedux />,
  },
  {
    title: "Redux Saga",
    link: "https://redux-saga.js.org/",
    icon: <SiReduxsaga />,
  },
  {
    title: "Next.js",
    link: "https://nextjs.org/",
    icon: <SiNextdotjs />,
  },
  {
    title: "Node.js",
    link: "https://nodejs.org/",
    icon: <SiNodedotjs />,
  },
  {
    title: "Express",
    link: "https://expressjs.com/",
    icon: <SiExpress />,
  },
  {
    title: "PostgreSQL",
    link: "https://www.postgresql.org/",
    icon: <SiPostgresql />,
  },
  {
    title: "MongoDB",
    link: "https://www.mongodb.com/",
    icon: <SiMongodb />,
  },
];
