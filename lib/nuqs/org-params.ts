import { type Options, useQueryStates, debounce } from "nuqs";
import { createLoader, parseAsBoolean, type UrlKeys } from "nuqs/server";
import { commonParsers, commonUrlKeys } from "./global-params";

export const orgSearchParams = {
  ...commonParsers,
  isActive: parseAsBoolean.withDefault(true),
};

export const orgUrlKeys: UrlKeys<typeof orgSearchParams> = {
  ...commonUrlKeys,
  isActive: "active",
};

export const loadOrgParams = createLoader(orgSearchParams, {
  urlKeys: orgUrlKeys,
});

export const useOrgParams = (options: Options = {}) =>
  useQueryStates(orgSearchParams, {
    shallow: false,
    limitUrlUpdates: debounce(300),
    ...options,
    urlKeys: orgUrlKeys,
  });
