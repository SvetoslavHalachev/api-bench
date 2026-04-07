import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { benchmarkResults } from '~/db/schema'
import { getDatabase } from '~/lib/db'
import { NotFoundError } from '~/lib/errors'

export const Route = createFileRoute('/api/results/$id')({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const db = await getDatabase()
				const result = await db
					.select()
					.from(benchmarkResults)
					.where(eq(benchmarkResults.id, params.id))
					.get()

				if (!result) {
					return new Response(JSON.stringify(new NotFoundError('Result not found').toJSON()), {
						status: 404,
						headers: { 'Content-Type': 'application/json' },
					})
				}

				return new Response(JSON.stringify(result), {
					headers: { 'Content-Type': 'application/json' },
				})
			},
		},
	},
})
