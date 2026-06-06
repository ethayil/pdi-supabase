import { type Options, useQueryStates } from "nuqs"
import { parseAsInteger, parseAsString, type UrlKeys } from "nuqs/server"

// --- Pagination ---
export const paginationParsers = {
	entriesPerPage: parseAsInteger.withDefault(20),
	currentPage: parseAsInteger.withDefault(1),
}

export const paginationUrlKeys: UrlKeys<typeof paginationParsers> = {
	entriesPerPage: "rows",
	currentPage: "page",

}

export const usePaginationParams = (options: Options = {}) =>
	useQueryStates(paginationParsers, {
		...options,
		urlKeys: paginationUrlKeys,
		shallow: false,
	})

// --- Date Filter ---
export const dateRangeParsers = {
	start: parseAsString.withDefault(""),
	end: parseAsString.withDefault(""),
}

export const useDateRangeParams = (options: Options = {}) =>
	useQueryStates(dateRangeParsers, {
		...options,
		shallow: false,
	})

export const commonParsers = {
	...paginationParsers,
	...dateRangeParsers,
	orgId: parseAsString.withDefault("all"),
	query: parseAsString.withDefault(""),
	category: parseAsString.withDefault("all"),
	categoryId: parseAsString.withDefault("all"),
}

export const commonUrlKeys: UrlKeys<typeof commonParsers> = {
	...paginationUrlKeys,
	category: "cat",
	query: "q",
}

export const useGlobalParams = (options: Options = {}) =>
	useQueryStates(commonParsers, {
		...options,
		shallow: false,
	})
