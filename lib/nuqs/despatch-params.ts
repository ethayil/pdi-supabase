import { type Options, useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsStringLiteral,
  type UrlKeys,
} from "nuqs/server";
import { commonParsers, commonUrlKeys } from "./global-params";

export const despatchSearchParams = {
  ...commonParsers,
  urgency: parseAsStringLiteral(["all", "overdue", "due_today", "due_soon", "upcoming"]).withDefault("all"),
};

export const despatchUrlKeys: UrlKeys<typeof despatchSearchParams> = {
  ...commonUrlKeys,
  urgency: "urgency",
};

export const loadDespatchParams = createLoader(despatchSearchParams, {
  urlKeys: despatchUrlKeys,
});

export const useDespatchParams = (options: Options = {}) =>
  useQueryStates(despatchSearchParams, {
    ...options,
    urlKeys: despatchUrlKeys,
    shallow: false,
  });
