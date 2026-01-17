import { parseAsInteger, parseAsString } from "nuqs";

export const searchAccountsPayment = {
  search: parseAsString.withDefault(""),
  status: parseAsString.withDefault("all"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
};

