import {clamp} from './math'

interface Color {
	r: number
	g: number
	b: number
}

function Color (r?: number, g?: number, b?: number): Color {
	return {
		r: typeof r === 'number' ? r : 0,
		g: typeof g === 'number' ? g : 0,
		b: typeof b === 'number' ? b : 0
	}
}

namespace Color {
	export function toHex (c: Color) {
		return (c.r * 255) << 16 ^ (c.g * 255) << 8 ^ (c.b * 255) << 0
	}

	/**
	 * Converts a hex number to Color struct.
	 * Writes result into out.
	 */
	export function fromHex (out: Color, hex: number) {
		const h = Math.floor(hex)
		out.r = (h >> 16 & 255) / 255
		out.g = (h >> 8 & 255) / 255
		out.b = (h & 255) / 255
		return out
	}

	/**
	 * Convert color value to string.
	 * Color can be hex number or struct.
	 */
	export function toHexString (color: number | Color) {
		const c = typeof color === 'number' ? fromHex(_c, color) : color
		return ('000000' + toHex(c).toString(16)).slice(-6)
	}

	/** Scale color and clamp results to 0-1 */
	export function scale (out: Color, c: Color, s: number) {
		out.r = clamp(c.r * s, 0, 1)
		out.g = clamp(c.g * s, 0, 1)
		out.b = clamp(c.b * s, 0, 1)
		return out
	}

	/** Scale a packed color */
	export function scaleHex (color: number, s: number) {
		fromHex(_c, color)
		scale(_c, _c, s)
		return toHex(_c)
	}

	const _c = Color() // tslint:disable-line variable-name
}

export default Color
