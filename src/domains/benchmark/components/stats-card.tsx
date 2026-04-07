import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { cn } from '~/lib/utils'
import type { EndpointResult } from '../types'

function formatMs(ms: number): string {
	return `${ms.toFixed(1)}ms`
}

function formatThroughput(rps: number): string {
	return `${rps.toFixed(1)} req/s`
}

function formatPercent(rate: number): string {
	return `${(rate * 100).toFixed(1)}%`
}

interface WinnerMap {
	avg: 'a' | 'b' | 'tie'
	p50: 'a' | 'b' | 'tie'
	p95: 'a' | 'b' | 'tie'
	p99: 'a' | 'b' | 'tie'
	throughput: 'a' | 'b' | 'tie'
	errorRate: 'a' | 'b' | 'tie'
}

interface StatsCardProps {
	result: EndpointResult
	tag: 'a' | 'b'
	winners?: WinnerMap
}

function MetricRow({
	label,
	value,
	winner,
	tag,
	lowerIsBetter = true,
}: {
	label: string
	value: string
	winner?: 'a' | 'b' | 'tie'
	tag: 'a' | 'b'
	lowerIsBetter?: boolean
}) {
	const isWinner = winner === tag
	const isLoser = winner !== undefined && winner !== 'tie' && winner !== tag

	return (
		<div className="flex items-center justify-between">
			<span className="text-xs text-muted-foreground">{label}</span>
			<div className="flex items-center gap-2">
				<span
					className={cn(
						'font-mono text-sm',
						isWinner && (lowerIsBetter ? 'text-emerald-500' : 'text-emerald-500'),
						isLoser && (lowerIsBetter ? 'text-red-500' : 'text-red-500'),
					)}
				>
					{value}
				</span>
				{isWinner && (
					<Badge variant="outline" className="border-emerald-500/50 text-emerald-500">
						faster
					</Badge>
				)}
				{isLoser && (
					<Badge variant="outline" className="border-red-500/50 text-red-500">
						slower
					</Badge>
				)}
			</div>
		</div>
	)
}

export function StatsCard({ result, tag, winners }: StatsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<span>{result.label}</span>
					<Badge variant="secondary" className="font-mono text-xs">
						{result.method}
					</Badge>
				</CardTitle>
				<div className="truncate font-mono text-xs text-muted-foreground">{result.url}</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<span className="text-xs font-medium">Latency</span>
					<MetricRow
						label="avg"
						value={formatMs(result.latency.avg)}
						winner={winners?.avg}
						tag={tag}
					/>
					<MetricRow
						label="p50"
						value={formatMs(result.latency.p50)}
						winner={winners?.p50}
						tag={tag}
					/>
					<MetricRow
						label="p95"
						value={formatMs(result.latency.p95)}
						winner={winners?.p95}
						tag={tag}
					/>
					<MetricRow
						label="p99"
						value={formatMs(result.latency.p99)}
						winner={winners?.p99}
						tag={tag}
					/>
				</div>
				<Separator />
				<div className="flex flex-col gap-2">
					<span className="text-xs font-medium">Throughput</span>
					<MetricRow
						label="req/s"
						value={formatThroughput(result.throughput)}
						winner={winners?.throughput}
						tag={tag}
						lowerIsBetter={false}
					/>
				</div>
				<Separator />
				<div className="flex flex-col gap-2">
					<span className="text-xs font-medium">Errors</span>
					<MetricRow
						label="error rate"
						value={formatPercent(result.errorRate)}
						winner={winners?.errorRate}
						tag={tag}
					/>
				</div>
				<Separator />
				<div className="flex flex-col gap-2">
					<span className="text-xs font-medium">Status Codes</span>
					{Object.entries(result.statusCodes).map(([code, count]) => (
						<div key={code} className="flex items-center justify-between">
							<span className="font-mono text-xs text-muted-foreground">{code}</span>
							<span className="font-mono text-sm">{count}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
