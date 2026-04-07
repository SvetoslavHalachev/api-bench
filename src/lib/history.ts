export interface HistoryEntry {
	id: string
	endpointAUrl: string
	endpointALabel: string
	endpointBUrl: string
	endpointBLabel: string
	timestamp: number
}

const STORAGE_KEY = 'bench-history'
const MAX_ENTRIES = 10

export function getHistory(): HistoryEntry[] {
	if (typeof window === 'undefined') return []
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		return JSON.parse(raw) as HistoryEntry[]
	} catch {
		return []
	}
}

export function addToHistory(entry: HistoryEntry): void {
	const history = getHistory()
	const updated = [entry, ...history.filter((h) => h.id !== entry.id)].slice(0, MAX_ENTRIES)
	localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function clearHistory(): void {
	localStorage.removeItem(STORAGE_KEY)
}
