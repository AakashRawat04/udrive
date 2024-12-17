import { formatISO, format } from "date-fns";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const toISODateWithLocalTimeZone = (date: Date) => {
  // @ts-expect-error
  return formatISO(date, { representation: "complete" });
};

export const toDateInQueryFormat = (date: Date) => {
  // @ts-expect-error
  return format(date, "yyyy-MM-dd");
};

export const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}