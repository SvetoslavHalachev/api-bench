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
import { getThemeFn, type Theme, ThemeProvider, themeScript } from '~/lib/theme'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient
}>()({
	beforeLoad: async () => {
		const theme = await getThemeFn()
		return { theme }
	},
	errorComponent: ({ error }) => (
		<RootDocument initialTheme="dark">
			<ErrorFallback message={error instanceof Error ? error.message : undefined} showRetry />
		</RootDocument>
	),
	notFoundComponent: () => (
		<RootDocument initialTheme="dark">
			<NotFoundFallback />
		</RootDocument>
	),
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ title: 'api-bench — Side-by-side API benchmarking' },
			{
				name: 'description',
				content:
					'Compare two API endpoints side-by-side. Get latency percentiles, throughput, and shareable results.',
			},
			{ name: 'theme-color', content: '#0d1117' },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:url', content: 'https://bench.devglory.dev' },
			{ property: 'og:title', content: 'api-bench — Side-by-side API benchmarking' },
			{
				property: 'og:description',
				content:
					'Compare two API endpoints side-by-side. Get latency percentiles, throughput, and shareable results.',
			},
			{ name: 'twitter:card', content: 'summary' },
			{ name: 'twitter:title', content: 'api-bench — Side-by-side API benchmarking' },
			{
				name: 'twitter:description',
				content:
					'Compare two API endpoints side-by-side. Get latency percentiles, throughput, and shareable results.',
			},
		],
		links: [
			{ rel: 'stylesheet', href: appCss },
			{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
			{ rel: 'manifest', href: '/site.webmanifest' },
			{ rel: 'canonical', href: 'https://bench.devglory.dev' },
		],
		scripts: [
			{
				type: 'application/ld+json',
				children: JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'WebApplication',
					name: 'api-bench',
					url: 'https://bench.devglory.dev',
					description: 'Compare two API endpoints side-by-side with real-time benchmarking.',
					applicationCategory: 'DeveloperApplication',
					operatingSystem: 'Any',
					offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
				}),
			},
		],
	}),
	component: RootComponent,
})

function RootComponent() {
	const { queryClient, theme } = useRouteContext({ from: '__root__' })
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider initialTheme={theme}>
				<RootDocument initialTheme={theme}>
					<Outlet />
				</RootDocument>
			</ThemeProvider>
		</QueryClientProvider>
	)
}

function RootDocument({
	children,
	initialTheme = 'dark',
}: Readonly<{ children: ReactNode; initialTheme?: Theme }>) {
	return (
		<html
			lang="en"
			className={initialTheme === 'dark' ? 'dark' : undefined}
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static theme script, no user input */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body className="min-h-screen bg-background text-foreground antialiased">
				<TooltipProvider>
					<div className="flex min-h-screen flex-col">
						<Header />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
				</TooltipProvider>
				<Toaster theme={initialTheme} />
				<Scripts />
			</body>
		</html>
	)
}
