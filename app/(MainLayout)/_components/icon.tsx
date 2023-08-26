import { cloneElement, ReactElement } from "react";

export interface IconProps {
  children: ReactElement;
}
export default function Icon({ children }: IconProps) {
  return cloneElement(children, {
    className: "sm:h-6 sm:w-6 w-4 h-4",
  });
}
