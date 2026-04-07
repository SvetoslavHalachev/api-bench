/// <reference types="vite/client" />
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouteContext,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { Footer } from '~/components/layout/footer'
import { Header } from '~/components/layout/header'
import { ErrorFallback, NotFoundFallback } from '~/components/shared/error-fallback'
import { TooltipProvider } from '~/components/ui/tooltip'
import { ThemeProvider } from '~/lib/theme'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient
}>()({
	errorComponent: ({ error }) => (
		<RootDocument>
			<ErrorFallback message={error instanceof Error ? error.message : undefined} showRetry />
		</RootDocument>
	),
	notFoundComponent: () => (
		<RootDocument>
			<NotFoundFallback />
		</RootDocument>
	),
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{ title: 'api-bench — Side-by-side API benchmarking' },
			{
				name: 'description',
				content:
					'Compare two API endpoints side-by-side. Get latency percentiles, throughput, and shareable results.',
			},
		],
		links: [{ rel: 'stylesheet', href: appCss }],
	}),
	component: RootComponent,
})

function RootComponent() {
	const { queryClient } = useRouteContext({ from: '__root__' })
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<RootDocument>
					<Outlet />
				</RootDocument>
			</ThemeProvider>
		</QueryClientProvider>
	)
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-background text-foreground antialiased">
				<TooltipProvider>
					<div className="flex min-h-screen flex-col">
						<Header />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
				</TooltipProvider>
				<Toaster theme="system" />
				<Scripts />
			</body>
		</html>
	)
}
