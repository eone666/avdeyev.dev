import { cloneElement, ReactElement } from "react";

export interface IconProps {
  children: ReactElement;
}
export default function Icon({ children }: IconProps) {
  return cloneElement(children, { className: "sm:w-20 sm:h-20 h-10 w-10" });
}
