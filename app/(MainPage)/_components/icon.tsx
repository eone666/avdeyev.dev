import { cloneElement, ReactElement } from "react";

export interface IconProps {
  children: ReactElement;
}
export default function Icon({ children }: IconProps) {
  return cloneElement(children, { className: "sm:w-16 sm:h-16 h-10 w-10" });
}
