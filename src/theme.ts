// tslint:disable no-conditional-assignment

import Color from './lib/Color'

export interface ThemeColors {
	fg?: number
	bg?: number

	fga?: number
	'fga-h'?: number
	'fga-a'?: number

	bga?: number
	'bga-h'?: number
	'bga-a'?: number

	fgc?: number
	'fgc-h'?: number
	'fgc-a'?: number

	bgc?: number
	'bgc-h'?: number
	'bgc-a'?: number

	svg?: number
	wave?: number
}

export type ThemeMode = 'light' | 'dark'

export interface Theme {
	name: string
	mode: ThemeMode
	colors: ThemeColors
}

export const THEMES: Theme[] = [
	{name: 'bespin', mode: 'dark', colors: {bg: 0x38332F, fgc: 0x937121, bgc: 0x28211C, wave: 0x54BE0D}}, // fg: 0x9B859D,
	{name: 'blackboard', mode: 'dark', colors: {fg: 0xCCCCCC, bg: 0x1C2031, fgc: 0xDDDDDD, bgc: 0x2C3142, wave: 0xCCCC00}},
	{name: 'cobalt', mode: 'light', colors: {fg: 0xBBBBDD, bg: 0x001C2C, fgc: 0x0099FF, bgc: 0x112848, svg: 0x0077EE, wave: 0x0099FF}},
	{name: 'darcula', mode: 'light', colors: {fg: 0xCCCCCC, bg: 0x313335, fgc: 0x6897BB, bgc: 0x404345, wave: 0x61A151}},
	{name: 'elegant', mode: 'light', colors: {wave: 0x998855}},
	{name: 'erlang-dark', mode: 'dark', colors: {bg: 0x001832, fgc: 0x99AAFF, bgc: 0x003A68, wave: 0xCCAAAA}},
	{name: 'gruvbox-dark', mode: 'dark', colors: {wave: 0x928374}},
	{name: 'hopscotch', mode: 'dark', colors: {}},
	{name: 'icecoder', mode: 'dark', colors: {bg: 0x262626, wave: 0x3C88BB, fgc: 0x97A3AA, bgc: 0x3F3F46}}, //6CB5D9
	{name: 'lesser-dark', mode: 'dark', colors: {}},
	{name: 'liquibyte', mode: 'dark', colors: {bg: 0x1A1A1A, wave: 0x5967FF}},
	{name: 'lucario', mode: 'dark', colors: {bg: 0x263442, fgc: 0x5C98CD, bgc: 0x2F4254, wave: 0x7744AA}}, // wave: 0x5C98CD}}, //2b3e50
	{name: 'material', mode: 'dark', colors: {fg: 0xAAACAF, bg: 0x242829, fgc: 0x92C2FF, bgc: 0x333636, wave: 0x537F7E}},
	{name: 'mbo', mode: 'dark', colors: {fgc: 0x95958A, bgc: 0x444440, wave: 0x85857A}},
	{name: 'neat', mode: 'light', colors: {wave: 0x55BB55}},
	{name: 'neo', mode: 'light', colors: {wave: 0x75438A}},
	{name: 'oceanic-next', mode: 'dark', colors: {}},
	{name: 'paraiso-dark', mode: 'dark', colors: {}},
	{name: 'paraiso-light', mode: 'light', colors: {bg: 0xDBDBCE, bgc: 0xC8C8AA, wave: 0x8D68B4}},
	{name: 'seti', mode: 'dark', colors: {bg: 0x202325, wave: 0x6D8A88}},
	{name: 'shadowfox', mode: 'dark', colors: {fg: 0xAAABAF, bg: 0x202023, fgc: 0x7799FF, bgc: 0x3A3848, wave: 0xB98EFF}},
	{name: 'solarized', mode: 'light', colors: {fg: 0x333333, bg: 0xE8E8E8, bgc: 0xDDDDDD, wave: 0x839496}},
	{name: 'twilight', mode: 'dark', colors: {bg: 0x222222, wave: 0x997711}},
	{name: 'yeti', mode: 'light', colors: {wave: 0xA074C4}},
	{name: 'zenburn', mode: 'dark', colors: {wave: 0x9C9C8F}}
]

export const DEFAULT_LIGHT: Theme = {
	name: 'default-light',
	mode: 'light',
	colors: {
		'fg': 0x333333,
		'bg': 0xE4E4E4,

		'fga': 0x555555,
		'fga-h': 0x777777,
		'fga-a': 0x777777,

		'bga': 0xD8D8D8,
		'bga-h': 0xCCCCCC,
		'bga-a': 0xCCCCCC,

		'fgc': 0x444444,
		'fgc-h': 0x555555,
		'fgc-a': 0x777777,

		'bgc': 0xD8D8D8,
		'bgc-h': 0xCCCCCC,
		'bgc-a': 0xBBBBBB,

		'svg': 0x555555,
		'wave': 0x666666
	}
}

export const DEFAULT_DARK: Theme = {
	name: 'default',
	mode: 'dark',
	colors: {
		'fg': 0xCCCCCC,
		'bg': 0x333333,

		'fga': 0xDDDDDD,
		'fga-h': 0xEEEEEE,
		'fga-a': 0xFFFFFF,

		'bga': 0x333333,
		'bga-h': 0x444444,
		'bga-a': 0x444444,

		'fgc': 0xDDDDDD,
		'fgc-h': 0xEEEEEE,
		'fgc-a': 0xFFFFFF,

		'bgc': 0x444444,
		'bgc-h': 0x555555,
		'bgc-a': 0x777777,

		'svg': 0xAAAAAA,
		'wave': 0xAAAAAA
	}
}

function altColor (colors: ThemeColors, alts: (keyof ThemeColors)[]) {
	for (const alt of alts) {
		if (colors[alt] != null) return colors[alt]
	}
	return undefined
}

export function computeColor (theme: Theme, k: keyof ThemeColors): number | undefined {
	const sign = theme.mode === 'light' ? 1 : -1
	if (k === 'fga-h' || k === 'fgc-h') {
		return theme.colors.fgc != null
			? Color.scaleHex(theme.colors.fgc, 1.1) // 1 + sign * 0.1)
			: undefined
	}
	if (k === 'fga-a' || k === 'fgc-a') {
		return theme.colors.fgc != null
			? Color.scaleHex(theme.colors.fgc, 1.5) // + sign * 0.5)
			: undefined
	}
	if (k === 'bga-h' || k === 'bgc-h') {
		return theme.colors.bgc != null
			? Color.scaleHex(theme.colors.bgc, 1.2) // + sign * 0.1)
			: undefined
	}
	if (k === 'bga-a' || k === 'bgc-a') {
		return theme.colors.bgc != null
			? Color.scaleHex(theme.colors.bgc, 1.3) // 1 + sign * 0.2)
			: undefined
	}
	if (k === 'svg') {
		return theme.colors.fgc != null
			? Color.scaleHex(theme.colors.fgc, 1 + sign * 0.2)
			: undefined
	}
	if (k === 'wave') {
		return theme.colors.fgc != null
			? Color.scaleHex(theme.colors.fgc, 1 + sign * 0.2)
			: undefined
	}
	return undefined
}

export function getColor (theme: Theme, k: keyof ThemeColors): number {
	let c = theme.colors[k]
	if (c != null) {
		return c
	}
	// Try to generate a color based on other info
	const defaults = theme.mode === 'dark' ? DEFAULT_DARK.colors : DEFAULT_LIGHT.colors
	if (k === 'fga') {
		if ((c = altColor(theme.colors, ['fgc'])) == null) {
			c = computeColor(theme, 'fga')
		}
		return c != null ? c : defaults[k]!
	}
	if (k === 'fgc') {
		if ((c = altColor(theme.colors, ['fga'])) == null) {
			c = computeColor(theme, 'fgc')
		}
		return c != null ? c : defaults[k]!
	}
	if (k === 'bga') {
		if ((c = altColor(theme.colors, ['bgc'])) == null) {
			c = computeColor(theme, 'bga')
		}
		return c != null ? c : defaults[k]!
	}
	if (k === 'bgc') {
		if ((c = altColor(theme.colors, ['bga'])) == null) {
			c = computeColor(theme, 'bgc')
		}
		return c != null ? c : defaults[k]!
	}
	if (k === 'fga-h' || k === 'fgc-h' || k === 'fga-a' || k === 'fgc-a') {
		c = computeColor(theme, k)
		return c != null ? c : defaults[k]!
	}
	if (k === 'bga-h' || k === 'bgc-h' || k === 'bga-a' || k === 'bgc-a') {
		c = computeColor(theme, k)
		return c != null ? c : defaults[k]!
	}
	if (k === 'wave' || k === 'svg') {
		c = computeColor(theme, k)
		return c != null ? c : defaults[k]!
	}
	return defaults[k]!
}

/** Apply the supplied theme */
export function setTheme (theme: Theme) {
	const keys = Object.keys(DEFAULT_LIGHT.colors) as (keyof ThemeColors)[]
	for (const key of keys) {
		//console.log('setting --clr-' + key, '#' + C3.toHexString(getColor(theme, key)))
		document.body.style.setProperty('--clr-' + key,
			'#' + Color.toHexString(getColor(theme, key))
		)
	}
}

/** Apply a theme by name */
export function applyTheme (name: string) {
	const theme = THEMES.find(t => t.name === name)
	if (!theme) {
		throw new Error(`Unkown theme: '${name}'`)
	}
	setTheme(theme)
}

export function themeColorStr (themeName: string, p: keyof ThemeColors) {
	const theme = THEMES.find(t => t.name === themeName)
	if (!theme) {
		throw new Error(`Unkown theme: '${name}'`)
	}
	const c = theme.colors[p] != null ? theme.colors[p]
		: (theme.mode === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT).colors[p]
	if (c == null) {
		return p === 'fg' || p === 'fgc' ? '#CCCCCC' : '#333333'
	}
	return '#' + Color.toHexString(Color.fromHex(Color(), c))
}
