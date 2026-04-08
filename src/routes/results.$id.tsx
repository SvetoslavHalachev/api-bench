import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ErrorFallback } from '~/components/shared/error-fallback'
import { ResultsComparison } from '~/domains/benchmark/components/results-comparison'
import type { EndpointResult } from '~/domains/benchmark/types'
import { resultQuery } from '~/domains/results/queries'

export const Route = createFileRoute('/results/$id')({
	loader: ({ context, params }) => context.queryClient.ensureQueryData(resultQuery(params.id)),
	head: ({ loaderData, params }) => {
		const row = loaderData as { endpointALabel?: string; endpointBLabel?: string } | undefined
		const labelA = row?.endpointALabel ?? 'Endpoint A'
		const labelB = row?.endpointBLabel ?? 'Endpoint B'
		const ogImage = `https://bench.devglory.dev/api/og/${params.id}`
		return {
			meta: [
				{ title: `API Bench results: ${labelA} vs ${labelB}` },
				{
					name: 'description',
					content: `Benchmark comparison of ${labelA} vs ${labelB}`,
				},
				{ property: 'og:title', content: `API Bench: ${labelA} vs ${labelB}` },
				{
					property: 'og:description',
					content: `Benchmark comparison of ${labelA} vs ${labelB}`,
				},
				{ property: 'og:image', content: ogImage },
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:image', content: ogImage },
			],
		}
	},
	errorComponent: ({ error }) => (
		<ErrorFallback
			title="Result not found"
			message={error.message || 'This benchmark result does not exist or has been deleted.'}
		/>
	),
	notFoundComponent: () => (
		<ErrorFallback
			title="Result not found"
			message="This benchmark result does not exist or may have expired."
		/>
	),
	component: ResultPage,
})

function ResultPage() {
	const { id } = Route.useParams()
	const { data } = useSuspenseQuery(resultQuery(id))

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
			<ResultsComparison
				resultA={data.resultA as unknown as EndpointResult}
				resultB={data.resultB as unknown as EndpointResult}
				onRunAgain="/"
			/>
		</div>
	)
}
