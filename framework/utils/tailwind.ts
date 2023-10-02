import { ClassValue, clsx } from "clsx";
import { twMerge } from "tw-merge";

export function merge(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}