import { queryOptions } from '@tanstack/react-query'
import { getResultFn } from './server-fns'

export const resultQuery = (id: string) =>
	queryOptions({
		queryKey: ['result', id],
		queryFn: () => getResultFn({ data: id }),
	})
