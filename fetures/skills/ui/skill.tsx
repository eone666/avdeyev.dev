import Link from "next/link";
import Icon from "@/fetures/skills/ui/icon";
import { ReactElement } from "react";

export interface SkillProps {
  title: string;
  link: string;
  icon: ReactElement;
}

export default function Skill({ title, link, icon }: SkillProps) {
  return (
    <li>
      <Link
        href={link}
        target="_blank"
        title={title}
        className="flex items-center gap-2 rounded-md bg-primary px-2 py-1 text-xs text-background xs:text-sm sm:text-base"
      >
        <Icon>{icon}</Icon> <span>{title}</span>
      </Link>
    </li>
  );
}
