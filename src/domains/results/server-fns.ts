import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { benchmarkResults } from '~/db/schema'
import { getDatabase } from '~/lib/db'

interface SavedResult {
	id: string
	createdAt: Date
	endpointALabel: string
	endpointAUrl: string
	endpointBLabel: string
	endpointBUrl: string
	config: Record<string, object>
	resultA: Record<string, object>
	resultB: Record<string, object>
}

export const getResultFn = createServerFn({ method: 'GET' })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }) => {
		const db = await getDatabase()
		const result = await db.select().from(benchmarkResults).where(eq(benchmarkResults.id, id)).get()

		if (!result) {
			throw new Error('Result not found')
		}

		return result as SavedResult
	})
