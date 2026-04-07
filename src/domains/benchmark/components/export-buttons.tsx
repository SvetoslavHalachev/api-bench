import { Button } from '~/components/ui/button'
import type { EndpointResult } from '../types'

interface ExportButtonsProps {
	resultA: EndpointResult
	resultB: EndpointResult
}

function downloadBlob(content: string, filename: string, mimeType: string) {
	const blob = new Blob([content], { type: mimeType })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

function formatTimestamp(): string {
	return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

function exportJSON(resultA: EndpointResult, resultB: EndpointResult) {
	const data = { resultA, resultB, exportedAt: new Date().toISOString() }
	downloadBlob(
		JSON.stringify(data, null, 2),
		`api-bench-${formatTimestamp()}.json`,
		'application/json',
	)
}

function exportCSV(resultA: EndpointResult, resultB: EndpointResult) {
	const rows = [
		['metric', 'endpoint_a', 'endpoint_b', 'winner'],
		['label', resultA.label, resultB.label, ''],
		['url', resultA.url, resultB.url, ''],
		[
			'avg_latency_ms',
			resultA.latency.avg.toFixed(1),
			resultB.latency.avg.toFixed(1),
			winner(resultA.latency.avg, resultB.latency.avg, 'lower'),
		],
		[
			'p50_ms',
			resultA.latency.p50.toFixed(1),
			resultB.latency.p50.toFixed(1),
			winner(resultA.latency.p50, resultB.latency.p50, 'lower'),
		],
		[
			'p95_ms',
			resultA.latency.p95.toFixed(1),
			resultB.latency.p95.toFixed(1),
			winner(resultA.latency.p95, resultB.latency.p95, 'lower'),
		],
		[
			'p99_ms',
			resultA.latency.p99.toFixed(1),
			resultB.latency.p99.toFixed(1),
			winner(resultA.latency.p99, resultB.latency.p99, 'lower'),
		],
		[
			'min_ms',
			resultA.latency.min.toFixed(1),
			resultB.latency.min.toFixed(1),
			winner(resultA.latency.min, resultB.latency.min, 'lower'),
		],
		[
			'max_ms',
			resultA.latency.max.toFixed(1),
			resultB.latency.max.toFixed(1),
			winner(resultA.latency.max, resultB.latency.max, 'lower'),
		],
		[
			'throughput_rps',
			resultA.throughput.toFixed(1),
			resultB.throughput.toFixed(1),
			winner(resultA.throughput, resultB.throughput, 'higher'),
		],
		[
			'error_rate',
			(resultA.errorRate * 100).toFixed(1),
			(resultB.errorRate * 100).toFixed(1),
			winner(resultA.errorRate, resultB.errorRate, 'lower'),
		],
		['total_requests', String(resultA.totalRequests), String(resultB.totalRequests), ''],
		['success_count', String(resultA.successCount), String(resultB.successCount), ''],
		['error_count', String(resultA.errorCount), String(resultB.errorCount), ''],
	]
	const csv = rows.map((row) => row.join(',')).join('\n')
	downloadBlob(csv, `api-bench-${formatTimestamp()}.csv`, 'text/csv')
}

function winner(a: number, b: number, mode: 'lower' | 'higher'): string {
	if (Math.abs(a - b) < 0.01) return 'tie'
	if (mode === 'lower') return a < b ? 'a' : 'b'
	return a > b ? 'a' : 'b'
}

export function ExportButtons({ resultA, resultB }: ExportButtonsProps) {
	return (
		<>
			<Button variant="outline" size="sm" onClick={() => exportJSON(resultA, resultB)}>
				Export JSON
			</Button>
			<Button variant="outline" size="sm" onClick={() => exportCSV(resultA, resultB)}>
				Export CSV
			</Button>
		</>
	)
}
