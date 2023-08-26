import Link from "next/link";
import Icon from "@/app/(MainLayout)/_components/icon";
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
        className="flex items-center gap-2 rounded-md bg-primary px-2 py-1 text-xs text-background sm:text-sm"
      >
        <Icon>{icon}</Icon> <span>{title}</span>
      </Link>
    </li>
  );
}
