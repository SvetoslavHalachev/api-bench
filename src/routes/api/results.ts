import { createFileRoute } from '@tanstack/react-router'
import { nanoid } from 'nanoid'
import { benchmarkResults } from '~/db/schema'
import { getDatabase } from '~/lib/db'
import { ValidationError } from '~/lib/errors'
import { saveResultSchema } from '~/lib/validators'

export const Route = createFileRoute('/api/results')({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const contentLength = Number(request.headers.get('content-length') ?? 0)
				if (contentLength > 256 * 1024) {
					return new Response(
						JSON.stringify({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request too large' } }),
						{ status: 413, headers: { 'Content-Type': 'application/json' } },
					)
				}

				let parsed: ReturnType<typeof saveResultSchema.parse>
				try {
					const body = await request.json()
					parsed = saveResultSchema.parse(body)
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Invalid request body'
					return new Response(JSON.stringify(new ValidationError(message).toJSON()), {
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					})
				}

				const db = await getDatabase()
				const id = nanoid(12)
				const endpointA = parsed.config.endpoints[0]
				const endpointB = parsed.config.endpoints[1]

				await db.insert(benchmarkResults).values({
					id,
					endpointALabel: endpointA.label || 'Endpoint A',
					endpointAUrl: endpointA.url,
					endpointBLabel: endpointB.label || 'Endpoint B',
					endpointBUrl: endpointB.url,
					config: parsed.config,
					resultA: parsed.resultA,
					resultB: parsed.resultB,
				})

				return new Response(JSON.stringify({ id }), {
					status: 201,
					headers: { 'Content-Type': 'application/json' },
				})
			},
		},
	},
})
