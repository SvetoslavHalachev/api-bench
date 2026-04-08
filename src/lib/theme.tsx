import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { createContext, type ReactNode, use, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const COOKIE_NAME = 'api-bench-theme'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

interface ThemeContextValue {
	theme: Theme
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: 'dark',
	toggleTheme: () => {},
})

export const getThemeFn = createServerFn({ method: 'GET' }).handler(async () => {
	const cookie = getRequestHeader('cookie') ?? ''
	const match = cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
	return (match?.[1] as Theme) || 'dark'
})

function applyThemeClass(theme: Theme) {
	if (typeof document === 'undefined') return
	const root = document.documentElement
	if (theme === 'dark') {
		root.classList.add('dark')
	} else {
		root.classList.remove('dark')
	}
}

export function ThemeProvider({
	children,
	initialTheme = 'dark',
}: {
	children: ReactNode
	initialTheme?: Theme
}) {
	const [theme, setThemeState] = useState<Theme>(initialTheme)

	function toggleTheme() {
		const next = theme === 'dark' ? 'light' : 'dark'
		setThemeState(next)
		applyThemeClass(next)
		// biome-ignore lint/suspicious/noDocumentCookie: simple cookie persistence
		document.cookie = `${COOKIE_NAME}=${next};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`
	}

	useEffect(() => {
		applyThemeClass(theme)
	}, [theme])

	return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
	return use(ThemeContext)
}

/**
 * Blocking inline script to prevent theme flash (FOUC).
 * This is a static string with no user input — safe for dangerouslySetInnerHTML.
 * biome-ignore lint/security/noDangerouslySetInnerHtml: static theme script, no user input
 */
export const themeScript = `(function(){try{var c=document.cookie.match(/(?:^|; )api-bench-theme=([^;]*)/);var t=c?c[1]:'dark';if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`
