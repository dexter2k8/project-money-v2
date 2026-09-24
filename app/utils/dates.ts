import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDateBR(value: unknown): string {
  if (!value) return "";
  const str = String(value);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const date = new Date(str);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${day}/${m}/${y}`;
}

const BRT_TZ = "America/Sao_Paulo";

export function parseDateLocal(dateStr: string): Date {
  if (/[+-]\d{2}:\d{2}$/.test(dateStr)) {
    return dayjs(dateStr).toDate();
  }
  return dayjs.tz(dateStr, BRT_TZ).toDate();
}

export function parseDateUTC(dateStr: string): Date {
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  }
  const clean = String(dateStr).replace(/[^0-9]/g, "");
  if (clean.length >= 8) {
    return new Date(Date.UTC(
      Number(clean.substring(0, 4)),
      Number(clean.substring(4, 6)) - 1,
      Number(clean.substring(6, 8)),
    ));
  }
  return new Date(dateStr);
}

export const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export const MONTH_ABBRS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];
