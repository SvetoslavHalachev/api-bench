import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: HomePage,
})

function HomePage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
			<div className="flex flex-col items-center gap-4 text-center">
				<h1 className="text-4xl font-bold tracking-tight">api-bench</h1>
				<p className="max-w-md text-lg text-muted-foreground">
					Compare two API endpoints side-by-side. Get latency percentiles,
					throughput, and shareable results.
				</p>
			</div>
			<div className="rounded-lg border border-border/50 bg-card p-8 text-card-foreground shadow-sm">
				<p className="font-mono text-sm text-muted-foreground">
					Benchmark form coming in Phase 3...
				</p>
			</div>
		</div>
	)
}
