import { createFileRoute } from '@tanstack/react-router'
import { generateOgImage } from '~/lib/og'

export const Route = createFileRoute('/api/og')({
	server: {
		handlers: {
			GET: async () => {
				const png = await generateOgImage({
					title: 'Compare API endpoints side-by-side',
					subtitle: 'Latency percentiles, throughput, and shareable results — all from the edge.',
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
