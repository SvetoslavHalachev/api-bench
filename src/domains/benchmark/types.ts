import type { EndpointConfig } from '~/lib/validators'

export interface RequestTiming {
	latency: number
	statusCode: number
	responseSize: number
	error?: string
}

export interface EndpointResult {
	label: string
	url: string
	method: string
	totalRequests: number
	successCount: number
	errorCount: number
	errorRate: number
	latency: {
		avg: number
		min: number
		max: number
		p50: number
		p95: number
		p99: number
	}
	throughput: number
	avgResponseSize: number
	statusCodes: Record<number, number>
	totalDuration: number
	timings: number[]
}

export interface BenchmarkProgress {
	type: 'progress'
	endpoint: 'a' | 'b'
	label: string
	completed: number
	total: number
	runningAvg: number
}

export interface BenchmarkComplete {
	type: 'complete'
	resultA: EndpointResult
	resultB: EndpointResult
}

export interface BenchmarkError {
	type: 'error'
	message: string
}

export type BenchmarkEvent = BenchmarkProgress | BenchmarkComplete | BenchmarkError

export interface BenchmarkRunConfig {
	endpoint: EndpointConfig
	label: string
	tag: 'a' | 'b'
	concurrency: number
	totalRequests: number
	timeout: number
}
