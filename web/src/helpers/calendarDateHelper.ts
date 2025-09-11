import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import format from "date-fns/format";
import parse from "date-fns/parse";
import { enUS } from "date-fns/locale";
import {dateFnsLocalizer} from "react-big-calendar";

const locales = { "en-US": enUS };
export const getStartOfWeek = (date: Date) => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

export const getWeekDay = (date: Date) => {
  return getDay(date) === 0 ? 6 : getDay(date) - 1;
};

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: getStartOfWeek,
  getDay: getWeekDay,
  locales,
});