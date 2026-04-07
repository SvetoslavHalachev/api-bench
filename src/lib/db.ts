import { drizzle } from 'drizzle-orm/d1'
import * as schema from '~/db/schema'

export function getDb(d1: D1Database) {
	return drizzle(d1, { schema })
}

export async function getDatabase() {
	const mod = await import('cloudflare:workers')
	const { env } = mod as unknown as { env: { DB: D1Database } }
	return getDb(env.DB)
}

export type Database = ReturnType<typeof getDb>
