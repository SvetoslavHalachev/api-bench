import { createFileRoute } from '@tanstack/react-router'
import { runBenchmark } from '~/domains/benchmark/engine'
import { ValidationError } from '~/lib/errors'
import { benchmarkRequestSchema } from '~/lib/validators'

export const Route = createFileRoute('/api/benchmark/stream')({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let parsed: ReturnType<typeof benchmarkRequestSchema.parse>
				try {
					const body = await request.json()
					parsed = benchmarkRequestSchema.parse(body)
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Invalid request body'
					return new Response(JSON.stringify(new ValidationError(message).toJSON()), {
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					})
				}

				const { endpoints, options } = parsed
				const encoder = new TextEncoder()

				const stream = new ReadableStream({
					async start(controller) {
						try {
							for await (const event of runBenchmark(endpoints[0], endpoints[1], options)) {
								const data = `data: ${JSON.stringify(event)}\n\n`
								controller.enqueue(encoder.encode(data))
							}
						} catch (error) {
							const message = error instanceof Error ? error.message : 'Benchmark failed'
							const errorEvent = `data: ${JSON.stringify({ type: 'error', message })}\n\n`
							controller.enqueue(encoder.encode(errorEvent))
						} finally {
							controller.close()
						}
					},
				})

				return new Response(stream, {
					headers: {
						'Content-Type': 'text/event-stream',
						'Cache-Control': 'no-cache',
						Connection: 'keep-alive',
					},
				})
			},
		},
	},
})
