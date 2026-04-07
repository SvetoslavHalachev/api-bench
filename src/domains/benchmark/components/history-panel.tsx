import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { clearHistory, getHistory, type HistoryEntry } from '~/lib/history'

interface HistoryPanelProps {
	onSelect: (entry: HistoryEntry) => void
}

function formatRelativeTime(timestamp: number): string {
	const diff = Date.now() - timestamp
	const minutes = Math.floor(diff / 60000)
	if (minutes < 1) return 'just now'
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	return `${days}d ago`
}

export function HistoryPanel({ onSelect }: HistoryPanelProps) {
	const [history, setHistory] = useState(getHistory)

	if (history.length === 0) return null

	function handleClear() {
		clearHistory()
		setHistory([])
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span className="text-sm font-medium">Recent Benchmarks</span>
					<Button variant="ghost" size="xs" onClick={handleClear}>
						Clear
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				{history.map((entry) => (
					<button
						key={entry.id}
						type="button"
						onClick={() => onSelect(entry)}
						className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2 text-left transition-colors hover:bg-muted"
					>
						<div className="flex flex-col gap-0.5">
							<span className="font-mono text-xs">
								{entry.endpointALabel || entry.endpointAUrl}
							</span>
							<span className="text-xs text-muted-foreground">
								vs {entry.endpointBLabel || entry.endpointBUrl}
							</span>
						</div>
						<span className="text-xs text-muted-foreground">
							{formatRelativeTime(entry.timestamp)}
						</span>
					</button>
				))}
			</CardContent>
		</Card>
	)
}
