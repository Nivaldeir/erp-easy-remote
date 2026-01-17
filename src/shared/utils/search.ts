import { parseAsInteger, parseAsString } from "nuqs";

export const searchWithPagination = {
  search: parseAsString.withDefault(""),
  startDate: parseAsString,
  endDate: parseAsString,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};