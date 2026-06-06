import { type Options, useQueryStates } from "nuqs"
import {
	createLoader,
	parseAsString,
	type UrlKeys,
} from "nuqs/server"
import { commonParsers, commonUrlKeys } from "./global-params"

export const productSearchParams = {
	...commonParsers,
	stockStatus: parseAsString.withDefault("active"),
	productId: parseAsString.withDefault(""),
}

export const productUrlKeys: UrlKeys<typeof productSearchParams> = {
	...commonUrlKeys,
	stockStatus: 'status'
}

export const loadProductParams = createLoader(productSearchParams, {
	urlKeys: productUrlKeys,
})

export const useProductParams = (options: Options = {}) =>
	useQueryStates(productSearchParams, {
		...options,
		urlKeys: productUrlKeys,
		shallow: false,
	})
