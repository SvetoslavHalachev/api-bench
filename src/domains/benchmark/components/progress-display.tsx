import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import type { BenchmarkProgress } from '../types'

interface ProgressDisplayProps {
	progressA: BenchmarkProgress | null
	progressB: BenchmarkProgress | null
	onCancel: () => void
}

function formatElapsed(seconds: number): string {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	if (mins > 0) {
		return `${mins}m ${secs}s`
	}
	return `${secs}s`
}

function EndpointProgress({ progress }: { progress: BenchmarkProgress | null }) {
	if (!progress) {
		return (
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Waiting...</span>
				</div>
				<Progress value={0} />
			</div>
		)
	}

	const pct = Math.round((progress.completed / progress.total) * 100)

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">{progress.label}</span>
				<span className="font-mono text-xs text-muted-foreground">
					{progress.completed}/{progress.total} — avg {progress.runningAvg.toFixed(1)}ms
				</span>
			</div>
			<Progress value={pct} />
		</div>
	)
}

export function ProgressDisplay({ progressA, progressB, onCancel }: ProgressDisplayProps) {
	const [elapsed, setElapsed] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setElapsed((prev) => prev + 1)
		}, 1000)
		return () => clearInterval(interval)
	}, [])

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<span className="relative flex size-2">
							<span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
							<span className="relative inline-flex size-2 rounded-full bg-primary" />
						</span>
						<span>Running benchmark...</span>
					</div>
					<span className="font-mono text-xs text-muted-foreground">{formatElapsed(elapsed)}</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<EndpointProgress progress={progressA} />
				<EndpointProgress progress={progressB} />
				<div className="flex justify-end">
					<Button variant="outline" size="sm" onClick={onCancel}>
						Cancel
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
