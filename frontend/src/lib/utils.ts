import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Axios } from "axios";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const axios = new Axios({
  withCredentials: true,
});
