import { createFileRoute } from '@tanstack/react-router'
import { BenchmarkForm } from '~/domains/benchmark/components/benchmark-form'
import { ProgressDisplay } from '~/domains/benchmark/components/progress-display'
import { ResultsComparison } from '~/domains/benchmark/components/results-comparison'
import { useBenchmarkStream } from '~/domains/benchmark/components/use-benchmark-stream'

export const Route = createFileRoute('/')({
	component: HomePage,
})

function HomePage() {
	const bench = useBenchmarkStream()

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
			<div className="flex flex-col items-center gap-2 py-6 text-center">
				<h1 className="text-xl font-semibold tracking-tight">api-bench</h1>
				<p className="max-w-md text-sm text-muted-foreground">
					Compare two API endpoints side-by-side. Get latency percentiles, throughput metrics, and
					shareable results in seconds.
				</p>
			</div>
			<BenchmarkForm onSubmit={bench.start} isRunning={bench.state === 'running'} />
			{bench.state === 'running' && (
				<ProgressDisplay
					progressA={bench.progressA}
					progressB={bench.progressB}
					onCancel={bench.cancel}
				/>
			)}
			{bench.state === 'complete' && bench.resultA && bench.resultB && (
				<ResultsComparison
					resultA={bench.resultA}
					resultB={bench.resultB}
					onRunAgain={bench.reset}
				/>
			)}
			{bench.state === 'error' && (
				<div className="flex flex-col items-center gap-4 rounded-lg border border-red-500/50 bg-red-500/10 p-6">
					<p className="text-sm text-red-500">{bench.errorMsg}</p>
					<button
						type="button"
						onClick={bench.reset}
						className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
					>
						Try again
					</button>
				</div>
			)}
		</div>
	)
}
