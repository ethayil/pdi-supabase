import { type Options, useQueryStates } from "nuqs"
import {
	createLoader,
	parseAsString,
	type UrlKeys,
} from "nuqs/server"
import { commonParsers, commonUrlKeys } from "./global-params"

export const userSearchParams = {
	...commonParsers,
	userType: parseAsString.withDefault("org"),
	userId: parseAsString.withDefault(""),

}

export const userUrlKeys: UrlKeys<typeof userSearchParams> = {
	...commonUrlKeys,
	userType: 'type'
}

export const loadUserParams = createLoader(userSearchParams, {
	urlKeys: userUrlKeys,
})

export const useUserParams = (options: Options = {}) =>
	useQueryStates(userSearchParams, {
		...options,
		urlKeys: userUrlKeys,
		shallow: false,
	})
