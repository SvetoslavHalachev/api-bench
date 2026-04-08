import { z } from 'zod'

export const httpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])

function isPrivateUrl(raw: string): boolean {
	try {
		const u = new URL(raw)
		if (u.protocol !== 'https:' && u.protocol !== 'http:') return true
		const h = u.hostname
		if (h === 'localhost' || h === '::1' || h === '0.0.0.0') return true
		if (/^127\./.test(h)) return true
		if (/^10\./.test(h)) return true
		if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
		if (/^192\.168\./.test(h)) return true
		if (/^169\.254\./.test(h)) return true
		return false
	} catch {
		return true
	}
}

export const endpointConfigSchema = z.object({
	url: z
		.string()
		.url('Must be a valid URL')
		.refine((v) => !isPrivateUrl(v), 'URL must not target internal or private network addresses'),
	label: z.string().max(50).optional(),
	method: httpMethodSchema.default('GET'),
	headers: z
		.record(z.string().max(1000))
		.refine((h) => Object.keys(h).length <= 20, 'Too many headers')
		.refine((h) => Object.keys(h).every((k) => /^[\w-]+$/.test(k)), 'Invalid header name')
		.optional(),
	body: z.string().max(10_000).optional(),
})

export const benchmarkOptionsSchema = z.object({
	concurrency: z.number().int().min(1).max(50).default(10),
	totalRequests: z.number().int().min(10).max(500).default(100),
	timeout: z.number().int().min(1000).max(30000).default(5000),
})

export const publicBenchmarkOptionsSchema = z.object({
	concurrency: z.number().int().min(1).max(30).default(10),
	totalRequests: z.number().int().min(10).max(200).default(100),
	timeout: z.number().int().min(1000).max(10000).default(5000),
})

export const benchmarkRequestSchema = z.object({
	endpoints: z.tuple([endpointConfigSchema, endpointConfigSchema]),
	options: benchmarkOptionsSchema.default({}),
})

export const publicBenchmarkRequestSchema = z.object({
	endpoints: z.tuple([endpointConfigSchema, endpointConfigSchema]),
	options: publicBenchmarkOptionsSchema.default({}),
})

export const saveResultSchema = z.object({
	config: publicBenchmarkRequestSchema,
	resultA: z
		.record(z.unknown())
		.refine((v) => JSON.stringify(v).length < 100_000, 'Result too large'),
	resultB: z
		.record(z.unknown())
		.refine((v) => JSON.stringify(v).length < 100_000, 'Result too large'),
})

export type HttpMethod = z.infer<typeof httpMethodSchema>
export type EndpointConfig = z.infer<typeof endpointConfigSchema>
export type BenchmarkOptions = z.infer<typeof benchmarkOptionsSchema>
export type BenchmarkRequest = z.infer<typeof benchmarkRequestSchema>
