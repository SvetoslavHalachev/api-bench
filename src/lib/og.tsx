import { initWasm, Resvg } from '@resvg/resvg-wasm'
import satori from 'satori'

let wasmInitialized = false

async function loadFont(): Promise<ArrayBuffer> {
	const res = await fetch(
		'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjA.ttf',
	)
	return res.arrayBuffer()
}

async function initResvg() {
	if (wasmInitialized) return
	try {
		// @ts-expect-error — WASM module import resolved at runtime by Cloudflare
		const wasmModule = await import('@resvg/resvg-wasm/index_bg.wasm')
		await initWasm(wasmModule.default ?? wasmModule)
		wasmInitialized = true
	} catch {
		wasmInitialized = true
	}
}

interface OgImageProps {
	title: string
	subtitle?: string
	stats?: {
		labelA: string
		labelB: string
		avgA: string
		avgB: string
		winner: 'a' | 'b'
	}
}

function OgImage({ title, subtitle, stats }: OgImageProps) {
	return (
		<div
			style={{
				width: '1200px',
				height: '630px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
				fontFamily: 'Inter',
				color: '#e6edf3',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
					marginBottom: '24px',
				}}
			>
				<svg width="48" height="48" viewBox="0 0 32 32" fill="none">
					<rect width="32" height="32" rx="6" fill="#e6edf3" />
					<path
						d="M8 22V14l4-4 4 6 4-8 4 12"
						stroke="#0d1117"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				<span style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em' }}>
					API Bench
				</span>
			</div>
			<div
				style={{
					fontSize: '48px',
					fontWeight: 700,
					textAlign: 'center',
					maxWidth: '900px',
					letterSpacing: '-0.03em',
					lineHeight: 1.2,
				}}
			>
				{title}
			</div>
			{subtitle && (
				<div
					style={{
						fontSize: '20px',
						color: '#8b949e',
						marginTop: '16px',
						textAlign: 'center',
						maxWidth: '700px',
					}}
				>
					{subtitle}
				</div>
			)}
			{stats && (
				<div
					style={{
						display: 'flex',
						gap: '48px',
						marginTop: '40px',
						padding: '24px 48px',
						background: 'rgba(255,255,255,0.05)',
						borderRadius: '16px',
						border: '1px solid rgba(255,255,255,0.1)',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '8px',
						}}
					>
						<span style={{ fontSize: '16px', color: '#8b949e' }}>{stats.labelA}</span>
						<span
							style={{
								fontSize: '36px',
								fontWeight: 700,
								color: stats.winner === 'a' ? '#3fb950' : '#f85149',
							}}
						>
							{stats.avgA}
						</span>
					</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							fontSize: '24px',
							color: '#8b949e',
						}}
					>
						vs
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '8px',
						}}
					>
						<span style={{ fontSize: '16px', color: '#8b949e' }}>{stats.labelB}</span>
						<span
							style={{
								fontSize: '36px',
								fontWeight: 700,
								color: stats.winner === 'b' ? '#3fb950' : '#f85149',
							}}
						>
							{stats.avgB}
						</span>
					</div>
				</div>
			)}
			<div
				style={{
					position: 'absolute',
					bottom: '24px',
					fontSize: '16px',
					color: '#484f58',
				}}
			>
				bench.devglory.dev
			</div>
		</div>
	)
}

export async function generateOgImage(props: OgImageProps): Promise<ArrayBuffer> {
	const [fontData] = await Promise.all([loadFont(), initResvg()])

	const svg = await satori(<OgImage {...props} />, {
		width: 1200,
		height: 630,
		fonts: [
			{
				name: 'Inter',
				data: fontData,
				weight: 400,
				style: 'normal',
			},
			{
				name: 'Inter',
				data: fontData,
				weight: 700,
				style: 'normal',
			},
		],
	})

	const resvg = new Resvg(svg, {
		fitTo: { mode: 'width', value: 1200 },
	})
	const png = resvg.render()
	const pngBytes = png.asPng()
	return pngBytes.buffer.slice(
		pngBytes.byteOffset,
		pngBytes.byteOffset + pngBytes.byteLength,
	) as ArrayBuffer
}
