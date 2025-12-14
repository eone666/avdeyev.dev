import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Location = {
    label?: string;
    city?: string;
    countryCode?: string;
    region?: string;
}

const locationOrder: (keyof Location)[] = [
    "label",
    "city",
    "region",
    "countryCode"
];

export function sortLocation(obj: Location) {
    const result: Location = {};

    locationOrder.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });

    return result;
}
