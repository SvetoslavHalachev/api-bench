import { z } from 'zod'

export const httpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])

export const endpointConfigSchema = z.object({
	url: z.string().url('Must be a valid URL'),
	label: z.string().max(50).optional(),
	method: httpMethodSchema.default('GET'),
	headers: z.record(z.string()).optional(),
	body: z.string().optional(),
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
	config: benchmarkRequestSchema,
	resultA: z.record(z.unknown()),
	resultB: z.record(z.unknown()),
})

export type HttpMethod = z.infer<typeof httpMethodSchema>
export type EndpointConfig = z.infer<typeof endpointConfigSchema>
export type BenchmarkOptions = z.infer<typeof benchmarkOptionsSchema>
export type BenchmarkRequest = z.infer<typeof benchmarkRequestSchema>
