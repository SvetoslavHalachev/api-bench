import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { benchmarkResults } from '~/db/schema'
import { getDatabase } from '~/lib/db'
import { generateOgImage } from '~/lib/og'

export const Route = createFileRoute('/api/og/$id')({
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
					return new Response('Not found', { status: 404 })
				}

				const resultA = result.resultA as { latency: { avg: number } }
				const resultB = result.resultB as { latency: { avg: number } }
				const avgA = resultA.latency.avg
				const avgB = resultB.latency.avg

				const png = await generateOgImage({
					title: `${result.endpointALabel} vs ${result.endpointBLabel}`,
					subtitle: 'API Benchmark Results',
					stats: {
						labelA: result.endpointALabel,
						labelB: result.endpointBLabel,
						avgA: `${avgA.toFixed(1)}ms`,
						avgB: `${avgB.toFixed(1)}ms`,
						winner: avgA < avgB ? 'a' : 'b',
					},
				})

				return new Response(png, {
					headers: {
						'Content-Type': 'image/png',
						'Cache-Control': 'public, max-age=86400, s-maxage=86400',
					},
				})
			},
		},
	},
})
