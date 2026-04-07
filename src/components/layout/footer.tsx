export function Footer() {
	return (
		<footer className="border-t border-border/50 py-6">
			<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-6">
				<p className="text-xs text-muted-foreground">
					Built with TanStack Start + Cloudflare Workers
				</p>
				<a
					href="https://github.com/SvetoslavHalachev/api-bench"
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					Open Source
				</a>
			</div>
		</footer>
	)
}
