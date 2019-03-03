import {THEMES} from './theme'

/** Global App state */
export interface State {
	/** Current theme name */
	readonly theme: string
}

const DEFAULT_THEME = 'shadowfox'

let initialTheme = localStorage.getItem('theme')
if (!initialTheme || !THEMES.some(t => t.name === initialTheme)) {
	initialTheme = DEFAULT_THEME
}

const _state = {
	theme: initialTheme
}
export const state: State = _state

/** Actions that update state */
export const actions = {
	/**
	 * Set current theme. Use undefined to unset previously saved theme
	 * and revert to default theme.
	 */
	setTheme: (theme: string | null | undefined) => {
		if (!theme) {
			localStorage.removeItem('theme')
			_state.theme = DEFAULT_THEME
		} else if (theme !== _state.theme) {
			if (THEMES.some(t => t.name === theme)) {
				_state.theme = theme
				localStorage.setItem('theme', theme)
			} else {
				console.warn('unrecognized theme:', theme)
			}
		}
		return _state.theme
	}
}
