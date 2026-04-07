import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { ResultsComparison } from '~/domains/benchmark/components/results-comparison'
import type { EndpointResult } from '~/domains/benchmark/types'
import { resultQuery } from '~/domains/results/queries'

export const Route = createFileRoute('/results/$id')({
	loader: ({ context, params }) => context.queryClient.ensureQueryData(resultQuery(params.id)),
	head: ({ loaderData }) => {
		const row = loaderData as { endpointALabel?: string; endpointBLabel?: string } | undefined
		const labelA = row?.endpointALabel ?? 'Endpoint A'
		const labelB = row?.endpointBLabel ?? 'Endpoint B'
		return {
			meta: [
				{ title: `api-bench results: ${labelA} vs ${labelB}` },
				{
					name: 'description',
					content: `Benchmark comparison of ${labelA} vs ${labelB}`,
				},
				{ property: 'og:title', content: `api-bench: ${labelA} vs ${labelB}` },
				{
					property: 'og:description',
					content: `Benchmark comparison of ${labelA} vs ${labelB}`,
				},
			],
		}
	},
	errorComponent: ({ error }) => (
		<div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 p-6">
			<h1 className="text-xl font-semibold tracking-tight">Result not found</h1>
			<p className="text-sm text-muted-foreground">
				{error.message || 'This benchmark result does not exist or has been deleted.'}
			</p>
			<Link to="/">
				<Button variant="outline">Back to Home</Button>
			</Link>
		</div>
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
