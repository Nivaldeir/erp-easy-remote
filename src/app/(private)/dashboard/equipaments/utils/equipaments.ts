import { parseAsInteger, parseAsString } from "nuqs";

export const searchEquipaments = {
  search: parseAsString.withDefault(""),
  status: parseAsString.withDefault("all"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};