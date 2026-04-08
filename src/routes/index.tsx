import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { BenchmarkForm } from '~/domains/benchmark/components/benchmark-form'
import { HistoryPanel } from '~/domains/benchmark/components/history-panel'
import { ProgressDisplay } from '~/domains/benchmark/components/progress-display'
import { ResultsComparison } from '~/domains/benchmark/components/results-comparison'
import { useBenchmarkStream } from '~/domains/benchmark/components/use-benchmark-stream'
import { ShareButton } from '~/domains/results/components/share-button'
import type { HistoryEntry } from '~/lib/history'
import { addToHistory } from '~/lib/history'

export const Route = createFileRoute('/')({
	component: HomePage,
})

function HomePage() {
	const bench = useBenchmarkStream()
	const [prefill, setPrefill] = useState<HistoryEntry | null>(null)

	function handleComplete() {
		if (bench.lastRequest) {
			const ep = bench.lastRequest.endpoints
			addToHistory({
				id: crypto.randomUUID(),
				endpointAUrl: ep[0].url,
				endpointALabel: ep[0].label || '',
				endpointBUrl: ep[1].url,
				endpointBLabel: ep[1].label || '',
				timestamp: Date.now(),
			})
		}
	}

	if (bench.state === 'complete' && bench.resultA && bench.resultB) {
		handleComplete()
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6">
			<div className="flex flex-col items-center gap-3 py-8 text-center">
				<div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
					<span className="relative flex size-1.5">
						<span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
						<span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
					</span>
					Open source API benchmarking tool
				</div>
				<h1 className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
					Benchmark APIs in seconds
				</h1>
				<p className="max-w-lg text-sm text-muted-foreground sm:text-base">
					Compare two endpoints side-by-side. Get latency percentiles, throughput metrics, and
					shareable results — all from the edge.
				</p>
			</div>
			<BenchmarkForm
				onSubmit={bench.start}
				isRunning={bench.state === 'running'}
				defaultValues={prefill}
			/>
			{bench.state === 'idle' && <HistoryPanel onSelect={setPrefill} />}
			{bench.state === 'running' && (
				<div className="animate-fade-in">
					<ProgressDisplay
						progressA={bench.progressA}
						progressB={bench.progressB}
						onCancel={bench.cancel}
					/>
				</div>
			)}
			{bench.state === 'complete' && bench.resultA && bench.resultB && (
				<div className="animate-slide-up">
					<ResultsComparison
						resultA={bench.resultA}
						resultB={bench.resultB}
						onRunAgain={bench.reset}
						actions={
							bench.lastRequest ? (
								<ShareButton
									resultA={bench.resultA}
									resultB={bench.resultB}
									config={bench.lastRequest}
								/>
							) : undefined
						}
					/>
				</div>
			)}
			{bench.state === 'error' && (
				<div className="animate-fade-in flex flex-col items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-6">
					<p className="text-sm text-destructive">{bench.errorMsg}</p>
					<button
						type="button"
						onClick={bench.reset}
						className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
					>
						Try again
					</button>
				</div>
			)}
		</div>
	)
}
