import { debounce, type Options, useQueryStates } from "nuqs";
import { createLoader, parseAsBoolean, type UrlKeys } from "nuqs/server";
import { commonParsers, commonUrlKeys } from "./global-params";

export const categorySearchParams = {
  ...commonParsers,
  isActive: parseAsBoolean.withDefault(true),
};

export const categoryUrlKeys: UrlKeys<typeof categorySearchParams> = {
  ...commonUrlKeys,
  isActive: "active",
};

export const loadCategoryParams = createLoader(categorySearchParams, {
  urlKeys: categoryUrlKeys,
});

export const useCategoryParams = (options: Options = {}) =>
  useQueryStates(categorySearchParams, {
    shallow: false,
    limitUrlUpdates: debounce(300),
    ...options,
    urlKeys: categoryUrlKeys,
  });
