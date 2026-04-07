import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import type { EndpointResult } from '~/domains/benchmark/types'
import type { BenchmarkRequest } from '~/lib/validators'

interface ShareButtonProps {
	resultA: EndpointResult
	resultB: EndpointResult
	config: BenchmarkRequest
}

export function ShareButton({ resultA, resultB, config }: ShareButtonProps) {
	const [saving, setSaving] = useState(false)

	async function handleShare() {
		setSaving(true)
		try {
			const response = await fetch('/api/results', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ config, resultA, resultB }),
			})

			if (!response.ok) {
				throw new Error('Failed to save results')
			}

			const { id } = (await response.json()) as { id: string }
			const url = `${window.location.origin}/results/${id}`
			await navigator.clipboard.writeText(url)
			toast.success('Link copied to clipboard!')
		} catch {
			toast.error('Failed to share results')
		} finally {
			setSaving(false)
		}
	}

	return (
		<Button variant="outline" onClick={handleShare} disabled={saving}>
			{saving ? 'Saving...' : 'Share Results'}
		</Button>
	)
}
