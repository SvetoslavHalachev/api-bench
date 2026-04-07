import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface ErrorFallbackProps {
	title?: string
	message?: string
	showHome?: boolean
	showRetry?: boolean
	onRetry?: () => void
}

export function ErrorFallback({
	title = 'Something went wrong',
	message,
	showHome = true,
	showRetry = false,
	onRetry,
}: ErrorFallbackProps) {
	return (
		<div className="flex min-h-[50vh] items-center justify-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-base">{title}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{message && (
						<pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs text-muted-foreground">
							{message}
						</pre>
					)}
					<div className="flex flex-wrap gap-2">
						{showHome && (
							<Link to="/">
								<Button variant="outline" size="sm">
									Go Home
								</Button>
							</Link>
						)}
						{showRetry && onRetry && (
							<Button variant="outline" size="sm" onClick={onRetry}>
								Try Again
							</Button>
						)}
						{showRetry && !onRetry && (
							<Button variant="outline" size="sm" onClick={() => window.location.reload()}>
								Reload
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export function NotFoundFallback() {
	return (
		<ErrorFallback
			title="Page not found"
			message="The page you're looking for doesn't exist."
			showRetry={false}
		/>
	)
}
