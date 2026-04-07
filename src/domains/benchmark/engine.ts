import type { BenchmarkOptions, EndpointConfig } from '~/lib/validators'
import type { BenchmarkEvent, BenchmarkRunConfig, EndpointResult, RequestTiming } from './types'

async function executeRequest(config: EndpointConfig, timeout: number): Promise<RequestTiming> {
	const start = performance.now()
	try {
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), timeout)

		const response = await fetch(config.url, {
			method: config.method,
			headers: config.headers,
			body: config.method !== 'GET' ? config.body : undefined,
			signal: controller.signal,
		})

		const body = await response.arrayBuffer()
		clearTimeout(timer)

		return {
			latency: performance.now() - start,
			statusCode: response.status,
			responseSize: body.byteLength,
		}
	} catch (error) {
		return {
			latency: performance.now() - start,
			statusCode: 0,
			responseSize: 0,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

function computePercentile(sorted: number[], p: number): number {
	if (sorted.length === 0) return 0
	const index = Math.ceil((p / 100) * sorted.length) - 1
	return sorted[Math.max(0, index)]
}

function computeStats(
	timings: RequestTiming[],
	config: BenchmarkRunConfig,
	totalDuration: number,
): EndpointResult {
	const latencies = timings.map((t) => t.latency).sort((a, b) => a - b)
	const successTimings = timings.filter((t) => !t.error)
	const errorTimings = timings.filter((t) => t.error)

	const statusCodes: Record<number, number> = {}
	for (const t of timings) {
		statusCodes[t.statusCode] = (statusCodes[t.statusCode] || 0) + 1
	}

	const totalResponseSize = timings.reduce((sum, t) => sum + t.responseSize, 0)
	const avgLatency =
		latencies.length > 0 ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length : 0

	return {
		label: config.label,
		url: config.endpoint.url,
		method: config.endpoint.method,
		totalRequests: timings.length,
		successCount: successTimings.length,
		errorCount: errorTimings.length,
		errorRate: timings.length > 0 ? errorTimings.length / timings.length : 0,
		latency: {
			avg: avgLatency,
			min: latencies[0] ?? 0,
			max: latencies[latencies.length - 1] ?? 0,
			p50: computePercentile(latencies, 50),
			p95: computePercentile(latencies, 95),
			p99: computePercentile(latencies, 99),
		},
		throughput: totalDuration > 0 ? (timings.length / totalDuration) * 1000 : 0,
		avgResponseSize: timings.length > 0 ? totalResponseSize / timings.length : 0,
		statusCodes,
		totalDuration,
		timings: latencies,
	}
}

async function* runEndpoint(config: BenchmarkRunConfig): AsyncGenerator<RequestTiming> {
	const { endpoint, concurrency, totalRequests, timeout } = config
	let completed = 0

	async function* batch(batchSize: number): AsyncGenerator<RequestTiming> {
		const promises = Array.from({ length: batchSize }, () => executeRequest(endpoint, timeout))
		const results = await Promise.all(promises)
		for (const result of results) {
			yield result
		}
	}

	while (completed < totalRequests) {
		const remaining = totalRequests - completed
		const batchSize = Math.min(concurrency, remaining)
		for await (const result of batch(batchSize)) {
			completed++
			yield result
		}
	}
}

export async function* runBenchmark(
	endpointA: EndpointConfig,
	endpointB: EndpointConfig,
	options: BenchmarkOptions,
): AsyncGenerator<BenchmarkEvent> {
	const configA: BenchmarkRunConfig = {
		endpoint: endpointA,
		label: endpointA.label || 'Endpoint A',
		tag: 'a',
		concurrency: options.concurrency,
		totalRequests: options.totalRequests,
		timeout: options.timeout,
	}

	const configB: BenchmarkRunConfig = {
		endpoint: endpointB,
		label: endpointB.label || 'Endpoint B',
		tag: 'b',
		concurrency: options.concurrency,
		totalRequests: options.totalRequests,
		timeout: options.timeout,
	}

	// Run endpoint A
	const timingsA: RequestTiming[] = []
	let runningSum = 0
	const startA = performance.now()

	for await (const timing of runEndpoint(configA)) {
		timingsA.push(timing)
		runningSum += timing.latency

		if (timingsA.length % 10 === 0 || timingsA.length === options.totalRequests) {
			yield {
				type: 'progress',
				endpoint: 'a',
				label: configA.label,
				completed: timingsA.length,
				total: options.totalRequests,
				runningAvg: runningSum / timingsA.length,
			}
		}
	}

	const durationA = performance.now() - startA
	const resultA = computeStats(timingsA, configA, durationA)

	// Run endpoint B
	const timingsB: RequestTiming[] = []
	runningSum = 0
	const startB = performance.now()

	for await (const timing of runEndpoint(configB)) {
		timingsB.push(timing)
		runningSum += timing.latency

		if (timingsB.length % 10 === 0 || timingsB.length === options.totalRequests) {
			yield {
				type: 'progress',
				endpoint: 'b',
				label: configB.label,
				completed: timingsB.length,
				total: options.totalRequests,
				runningAvg: runningSum / timingsB.length,
			}
		}
	}

	const durationB = performance.now() - startB
	const resultB = computeStats(timingsB, configB, durationB)

	yield {
		type: 'complete',
		resultA,
		resultB,
	}
}
