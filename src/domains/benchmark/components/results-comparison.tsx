import { Button } from '~/components/ui/button'
import type { EndpointResult } from '../types'
import { StatsCard } from './stats-card'

interface WinnerMap {
	avg: 'a' | 'b' | 'tie'
	p50: 'a' | 'b' | 'tie'
	p95: 'a' | 'b' | 'tie'
	p99: 'a' | 'b' | 'tie'
	throughput: 'a' | 'b' | 'tie'
	errorRate: 'a' | 'b' | 'tie'
}

function computeWinners(a: EndpointResult, b: EndpointResult): WinnerMap {
	function lowerWins(valA: number, valB: number): 'a' | 'b' | 'tie' {
		if (Math.abs(valA - valB) < 0.01) return 'tie'
		return valA < valB ? 'a' : 'b'
	}
	function higherWins(valA: number, valB: number): 'a' | 'b' | 'tie' {
		if (Math.abs(valA - valB) < 0.01) return 'tie'
		return valA > valB ? 'a' : 'b'
	}

	return {
		avg: lowerWins(a.latency.avg, b.latency.avg),
		p50: lowerWins(a.latency.p50, b.latency.p50),
		p95: lowerWins(a.latency.p95, b.latency.p95),
		p99: lowerWins(a.latency.p99, b.latency.p99),
		throughput: higherWins(a.throughput, b.throughput),
		errorRate: lowerWins(a.errorRate, b.errorRate),
	}
}

interface ResultsComparisonProps {
	resultA: EndpointResult
	resultB: EndpointResult
	onRunAgain: () => void
}

export function ResultsComparison({ resultA, resultB, onRunAgain }: ResultsComparisonProps) {
	const winners = computeWinners(resultA, resultB)

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold">Results</h2>
				<Button variant="outline" onClick={onRunAgain}>
					Run Again
				</Button>
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<StatsCard result={resultA} tag="a" winners={winners} />
				<StatsCard result={resultB} tag="b" winners={winners} />
			</div>
		</div>
	)
}
