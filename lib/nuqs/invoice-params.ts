import { type Options, useQueryStates } from "nuqs"
import {
	createLoader,
	parseAsStringLiteral,
	type UrlKeys,
} from "nuqs/server"
import { invoiceStatus } from "@/types/globals"
import { commonParsers, commonUrlKeys } from "./global-params"

export const invoiceSearchParams = {
	...commonParsers,
	status: parseAsStringLiteral([...invoiceStatus, 'all']).withDefault("all"),

}

export const invoiceUrlKeys: UrlKeys<typeof invoiceSearchParams> = {
	...commonUrlKeys,
}

export const loadInvoiceParams = createLoader(invoiceSearchParams, {
	urlKeys: invoiceUrlKeys,
})

export const useInvoiceParams = (options: Options = {}) =>
	useQueryStates(invoiceSearchParams, {
		...options,
		urlKeys: invoiceUrlKeys,
		shallow: false,
	})
