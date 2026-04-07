import { useRef, useState } from 'react'
import type { BenchmarkRequest } from '~/lib/validators'
import type { BenchmarkEvent, BenchmarkProgress, EndpointResult } from '../types'

type PageState = 'idle' | 'running' | 'complete' | 'error'

interface BenchmarkStreamState {
	state: PageState
	progressA: BenchmarkProgress | null
	progressB: BenchmarkProgress | null
	resultA: EndpointResult | null
	resultB: EndpointResult | null
	lastRequest: BenchmarkRequest | null
	errorMsg: string
	start: (request: BenchmarkRequest) => void
	cancel: () => void
	reset: () => void
}

function handleProgressEvent(
	event: BenchmarkEvent,
	setProgressA: (p: BenchmarkProgress) => void,
	setProgressB: (p: BenchmarkProgress) => void,
	setResultA: (r: EndpointResult) => void,
	setResultB: (r: EndpointResult) => void,
	setState: (s: PageState) => void,
	setErrorMsg: (m: string) => void,
) {
	if (event.type === 'progress') {
		if (event.endpoint === 'a') setProgressA(event)
		else setProgressB(event)
	} else if (event.type === 'complete') {
		setResultA(event.resultA)
		setResultB(event.resultB)
		setState('complete')
	} else if (event.type === 'error') {
		setErrorMsg(event.message)
		setState('error')
	}
}

async function readStream(response: Response, onEvent: (event: BenchmarkEvent) => void) {
	const reader = response.body?.getReader()
	if (!reader) throw new Error('No response body')

	const decoder = new TextDecoder()
	let buffer = ''

	while (true) {
		const { done, value } = await reader.read()
		if (done) break
		buffer += decoder.decode(value, { stream: true })
		const lines = buffer.split('\n\n')
		buffer = lines.pop() ?? ''
		for (const line of lines) {
			if (line.startsWith('data: ')) {
				onEvent(JSON.parse(line.slice(6)))
			}
		}
	}
}

export function useBenchmarkStream(): BenchmarkStreamState {
	const [state, setState] = useState<PageState>('idle')
	const [progressA, setProgressA] = useState<BenchmarkProgress | null>(null)
	const [progressB, setProgressB] = useState<BenchmarkProgress | null>(null)
	const [resultA, setResultA] = useState<EndpointResult | null>(null)
	const [resultB, setResultB] = useState<EndpointResult | null>(null)
	const [lastRequest, setLastRequest] = useState<BenchmarkRequest | null>(null)
	const [errorMsg, setErrorMsg] = useState('')
	const abortRef = useRef<AbortController | null>(null)

	async function start(request: BenchmarkRequest) {
		setLastRequest(request)
		setState('running')
		setProgressA(null)
		setProgressB(null)
		setResultA(null)
		setResultB(null)
		setErrorMsg('')

		const controller = new AbortController()
		abortRef.current = controller

		try {
			const response = await fetch('/api/benchmark/stream', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(request),
				signal: controller.signal,
			})

			if (!response.ok) {
				const body = (await response.json()) as { message?: string }
				throw new Error(body.message ?? 'Benchmark request failed')
			}

			await readStream(response, (event) => {
				handleProgressEvent(
					event,
					setProgressA,
					setProgressB,
					setResultA,
					setResultB,
					setState,
					setErrorMsg,
				)
			})
		} catch (err) {
			if ((err as Error).name === 'AbortError') {
				setState('idle')
			} else {
				setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
				setState('error')
			}
		}
	}

	function cancel() {
		abortRef.current?.abort()
		setState('idle')
	}

	function reset() {
		setState('idle')
		setResultA(null)
		setResultB(null)
	}

	return {
		state,
		progressA,
		progressB,
		resultA,
		resultB,
		lastRequest,
		errorMsg,
		start,
		cancel,
		reset,
	}
}
