import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const benchmarkResults = sqliteTable('benchmark_results', {
	id: text('id').primaryKey(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	endpointALabel: text('endpoint_a_label').notNull(),
	endpointAUrl: text('endpoint_a_url').notNull(),
	endpointBLabel: text('endpoint_b_label').notNull(),
	endpointBUrl: text('endpoint_b_url').notNull(),
	config: text('config', { mode: 'json' }).notNull(),
	resultA: text('result_a', { mode: 'json' }).notNull(),
	resultB: text('result_b', { mode: 'json' }).notNull(),
})

export type BenchmarkResultRow = typeof benchmarkResults.$inferSelect
export type NewBenchmarkResult = typeof benchmarkResults.$inferInsert
