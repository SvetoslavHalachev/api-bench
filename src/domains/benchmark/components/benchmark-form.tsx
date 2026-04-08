import { ChevronDown } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Slider } from '~/components/ui/slider'
import { cn } from '~/lib/utils'
import { type BenchmarkRequest, benchmarkRequestSchema, type HttpMethod } from '~/lib/validators'

interface HeaderEntry {
	id: string
	key: string
	value: string
}

interface EndpointFormState {
	url: string
	label: string
	method: HttpMethod
	headers: HeaderEntry[]
	body: string
	showAdvanced: boolean
}

let headerId = 0
function nextHeaderId(): string {
	return `h-${++headerId}`
}

function createEmptyEndpoint(): EndpointFormState {
	return {
		url: '',
		label: '',
		method: 'GET',
		headers: [{ id: nextHeaderId(), key: '', value: '' }],
		body: '',
		showAdvanced: false,
	}
}

interface BenchmarkFormProps {
	onSubmit: (request: BenchmarkRequest) => void
	isRunning: boolean
	defaultValues?: {
		endpointAUrl: string
		endpointALabel: string
		endpointBUrl: string
		endpointBLabel: string
	} | null
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

function EndpointInputGroup({
	state,
	onChange,
	defaultLabel,
}: {
	state: EndpointFormState
	onChange: (state: EndpointFormState) => void
	defaultLabel: string
}) {
	const showBody = state.method === 'POST' || state.method === 'PUT'

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor={`label-${defaultLabel}`}>Label</Label>
				<Input
					id={`label-${defaultLabel}`}
					placeholder={defaultLabel}
					value={state.label}
					onChange={(e) => onChange({ ...state, label: e.target.value })}
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor={`url-${defaultLabel}`}>URL</Label>
				<Input
					id={`url-${defaultLabel}`}
					placeholder="https://api.example.com/endpoint"
					value={state.url}
					onChange={(e) => onChange({ ...state, url: e.target.value })}
					required
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<Label>Method</Label>
				<Select
					value={state.method}
					onValueChange={(val) => {
						if (val) onChange({ ...state, method: val as HttpMethod })
					}}
				>
					<SelectTrigger className="w-full">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{HTTP_METHODS.map((m) => (
							<SelectItem key={m} value={m}>
								{m}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<button
				type="button"
				className={cn(
					'flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground',
				)}
				onClick={() => onChange({ ...state, showAdvanced: !state.showAdvanced })}
			>
				<ChevronDown
					className={cn('size-3 transition-transform', state.showAdvanced && 'rotate-180')}
				/>
				Advanced
			</button>
			{state.showAdvanced && (
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<Label>Headers</Label>
						{state.headers.map((header, i) => (
							<div key={header.id} className="flex gap-2">
								<Input
									placeholder="Key"
									value={header.key}
									onChange={(e) => {
										const next = [...state.headers]
										next[i] = { ...next[i], key: e.target.value }
										if (i === state.headers.length - 1 && e.target.value !== '') {
											next.push({ id: nextHeaderId(), key: '', value: '' })
										}
										onChange({ ...state, headers: next })
									}}
								/>
								<Input
									placeholder="Value"
									value={header.value}
									onChange={(e) => {
										const next = [...state.headers]
										next[i] = { ...next[i], value: e.target.value }
										onChange({ ...state, headers: next })
									}}
								/>
							</div>
						))}
					</div>
					{showBody && (
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`body-${defaultLabel}`}>Body</Label>
							<textarea
								id={`body-${defaultLabel}`}
								className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
								placeholder='{"key": "value"}'
								value={state.body}
								onChange={(e) => onChange({ ...state, body: e.target.value })}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export function BenchmarkForm({ onSubmit, isRunning, defaultValues }: BenchmarkFormProps) {
	const [endpointA, setEndpointA] = useState(createEmptyEndpoint)
	const [endpointB, setEndpointB] = useState(createEmptyEndpoint)
	const [concurrency, setConcurrency] = useState(10)
	const [totalRequests, setTotalRequests] = useState(100)
	const [timeout, setTimeout_] = useState(5)
	const [errors, setErrors] = useState<string[]>([])

	useEffect(() => {
		if (defaultValues) {
			setEndpointA((prev) => ({
				...prev,
				url: defaultValues.endpointAUrl,
				label: defaultValues.endpointALabel,
			}))
			setEndpointB((prev) => ({
				...prev,
				url: defaultValues.endpointBUrl,
				label: defaultValues.endpointBLabel,
			}))
		}
	}, [defaultValues])

	function buildHeaders(
		headers: Array<{ key: string; value: string }>,
	): Record<string, string> | undefined {
		const filtered = headers.filter((h) => h.key.trim() !== '')
		if (filtered.length === 0) return undefined
		const result: Record<string, string> = {}
		for (const h of filtered) {
			result[h.key] = h.value
		}
		return result
	}

	function handleSubmit(e: FormEvent) {
		e.preventDefault()
		setErrors([])

		const request = {
			endpoints: [
				{
					url: endpointA.url,
					label: endpointA.label || undefined,
					method: endpointA.method,
					headers: buildHeaders(endpointA.headers),
					body: endpointA.body || undefined,
				},
				{
					url: endpointB.url,
					label: endpointB.label || undefined,
					method: endpointB.method,
					headers: buildHeaders(endpointB.headers),
					body: endpointB.body || undefined,
				},
			] as const,
			options: {
				concurrency,
				totalRequests,
				timeout: timeout * 1000,
			},
		}

		const parsed = benchmarkRequestSchema.safeParse(request)
		if (!parsed.success) {
			const messages = parsed.error.issues.map((issue) => {
				const path = issue.path.join('.')
				return path ? `${path}: ${issue.message}` : issue.message
			})
			setErrors(messages)
			return
		}

		onSubmit(parsed.data)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Configure Benchmark</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="flex flex-col gap-6">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<EndpointInputGroup
							state={endpointA}
							onChange={setEndpointA}
							defaultLabel="Endpoint A"
						/>
						<EndpointInputGroup
							state={endpointB}
							onChange={setEndpointB}
							defaultLabel="Endpoint B"
						/>
					</div>
					<Separator />
					<div className="flex flex-col gap-4">
						<span className="text-sm font-medium">Options</span>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-between">
									<Label>Concurrency</Label>
									<span className="font-mono text-xs text-muted-foreground">{concurrency}</span>
								</div>
								<Slider
									min={1}
									max={50}
									step={1}
									value={[concurrency]}
									onValueChange={(v) => setConcurrency(Array.isArray(v) ? v[0] : v)}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-between">
									<Label>Requests</Label>
									<span className="font-mono text-xs text-muted-foreground">{totalRequests}</span>
								</div>
								<Slider
									min={10}
									max={500}
									step={10}
									value={[totalRequests]}
									onValueChange={(v) => setTotalRequests(Array.isArray(v) ? v[0] : v)}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-between">
									<Label>Timeout</Label>
									<span className="font-mono text-xs text-muted-foreground">{timeout}s</span>
								</div>
								<Slider
									min={1}
									max={30}
									step={1}
									value={[timeout]}
									onValueChange={(v) => setTimeout_(Array.isArray(v) ? v[0] : v)}
								/>
							</div>
						</div>
					</div>
					{errors.length > 0 && (
						<div className="flex flex-col gap-1 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
							{errors.map((err) => (
								<p key={err} className="text-xs text-red-500">
									{err}
								</p>
							))}
						</div>
					)}
					<Button type="submit" disabled={isRunning} size="lg" className="w-full">
						{isRunning ? (
							<span className="flex items-center gap-2">
								<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Running...
							</span>
						) : (
							'Run Benchmark'
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
