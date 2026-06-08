import { type Options, useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
  type UrlKeys,
} from "nuqs/server";
import { orderStatuses } from "@/types/globals";
import { commonParsers, commonUrlKeys } from "./global-params";

export const orderSearchParams = {
  ...commonParsers,
  status: parseAsStringLiteral([...orderStatuses, "all"]).withDefault("all"),
  ref: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
  post: parseAsString.withDefault(""),
  courier: parseAsString.withDefault(""),
  isActiveOnly: parseAsBoolean.withDefault(true),
};

export const orderUrlKeys: UrlKeys<typeof orderSearchParams> = {
  ...commonUrlKeys,
  isActiveOnly: "active",
};

export const loadOrderParams = createLoader(orderSearchParams, {
  urlKeys: orderUrlKeys,
});

export const useOrderParams = (options: Options = {}) =>
  useQueryStates(orderSearchParams, {
    ...options,
    urlKeys: orderUrlKeys,
    shallow: false,
  });
