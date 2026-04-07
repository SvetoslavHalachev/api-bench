import { createContext, type ReactNode, use, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
	theme: Theme
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'dark'
	const stored = localStorage.getItem('theme')
	if (stored === 'light' || stored === 'dark') return stored
	return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(getInitialTheme)

	useEffect(() => {
		const root = document.documentElement
		if (theme === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.remove('dark')
		}
		localStorage.setItem('theme', theme)
	}, [theme])

	function toggleTheme() {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
	}

	return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
	const ctx = use(ThemeContext)
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
	return ctx
}
