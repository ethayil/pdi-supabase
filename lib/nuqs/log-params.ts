import { type Options, useQueryStates } from "nuqs"
import {
	createLoader,
	parseAsString,
	type UrlKeys,
} from "nuqs/server"
import { commonParsers, commonUrlKeys } from "./global-params"

export const logSearchParams = {
	...commonParsers,
	user: parseAsString.withDefault(""),
	message: parseAsString.withDefault(""),
	entityType: parseAsString.withDefault("all"),

}

export const logUrlKeys: UrlKeys<typeof logSearchParams> = {
	...commonUrlKeys,
	entityType: 'type'
}

export const loadLogParams = createLoader(logSearchParams, {
	urlKeys: logUrlKeys,
})

export const useLogParams = (options: Options = {}) =>
	useQueryStates(logSearchParams, {
		...options,
		urlKeys: logUrlKeys,
		shallow: false,
	})
