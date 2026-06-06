import { debounce, type Options, useQueryStates } from "nuqs"
import {
	createLoader,
	parseAsBoolean,
	parseAsString,
	parseAsStringLiteral,
	type UrlKeys,
} from "nuqs/server"
import { orderStatuses } from "@/types/globals"
import { commonParsers, commonUrlKeys } from "./global-params"

export const orderSearchParams = {
	...commonParsers,
	status: parseAsStringLiteral([...orderStatuses, "all"]).withDefault("all"),
	ref: parseAsString.withDefault("").withOptions({ limitUrlUpdates: debounce(2000) }),
	name: parseAsString.withDefault("").withOptions({ limitUrlUpdates: debounce(2000) }),
	post: parseAsString.withDefault("").withOptions({ limitUrlUpdates: debounce(2000) }),
	courier: parseAsString.withDefault("").withOptions({ limitUrlUpdates: debounce(2000) }),
	isActiveOnly: parseAsBoolean.withDefault(true),

}

export const orderUrlKeys: UrlKeys<typeof orderSearchParams> = {
	...commonUrlKeys,
	isActiveOnly: 'active'
}

export const loadOrderParams = createLoader(orderSearchParams, {
	urlKeys: orderUrlKeys,
})

export const useOrderParams = (options: Options = {}) =>
	useQueryStates(orderSearchParams, {
		...options,
		urlKeys: orderUrlKeys,
		shallow: false,
	})
