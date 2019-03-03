// Math utils

export const PI2: number = Math.PI * 2.0

export function sign (n: number) {
	return (n > 0 ? 1 : n < 0 ? -1 : 0)
}

export function roundFrac (n: number, places: number) {
	const d = Math.pow(10, places)
	return Math.round(n * d) / d
}

export function clamp (n: number, min: number, max: number) {
	return Math.min(Math.max(n, min), max)
}

/**  Always positive modulus */
export function pmod (n: number, m: number) {
	return ((n % m + m) % m)
}

/** A random number from -1.0 to 1.0 */
export function nrand() {
	return Math.random() * 2.0 - 1.0
}

/**
 * Deterministic (pseudo) random number. Cheap calcluation.
 */
export function drand (x: number, y: number) {
	return Math.abs((Math.sin(dot2d(x, y, 12.9898, 78.233)) * 43758.5453) % 1)
}
/*float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}*/

export function angle (x: number, y: number) {
	return pmod(Math.atan2(y, x), PI2)
}

export function difAngle (a0: number, a1: number) {
	const r = pmod(a1, PI2) - pmod(a0, PI2)
	return Math.abs(r) < Math.PI ? r : r - PI2 * sign(r)
}

export function length2d (x: number, y: number) {
	return Math.sqrt(x * x + y * y)
}

export function length2dSq (x: number, y: number) {
	return x * x + y * y
}

export function dist2d (x0: number, y0: number, x1: number, y1: number) {
	return length2d(x1 - x0, y1 - y0)
}

export function dist2dSq (x0: number, y0: number, x1: number, y1: number) {
	return length2dSq(x1 - x0, y1 - y0)
}

export function dot2d (x0: number, y0: number, x1: number, y1: number): number {
	return (x0 * x1 + y0 * y1)
}

/**
 * Linear interplation from x to y.
 * a must be from 0.0 to 1.0
 */
export function lerp (x: number, y: number, a: number): number {
	const b = 1.0 - a
	return (x * b + y * a)
}

export function lerpAngle (x: number, y: number, a: number): number {
	const d = difAngle(x, y)
	return pmod(x + d * a, PI2)
}

/**
 * Trigonometric interpolation from x to y (smoothed at endpoints.)
 * a must be from 0.0 to 1.0
 */
export function terp (x: number, y: number, a: number): number {
	const r = Math.PI * a
	const s = (1.0 - Math.cos(r)) * 0.5
	const t = 1.0 - s
	return (x * t + y * s)
}

/**
 * Exponential interpolation
 * @param x Start value
 * @param y End value
 * @param a Amount (0-1)
 * @param e Exponent
 */
export function xerp (x: number, y: number, a: number, e: number): number {
	let s: number
	if (a < 0.5) {
		s = Math.pow(a * 2.0, e) / 2.0
	} else {
		s = 1.0 - (a - 0.5) * 2.0
		s = Math.pow(s, e) / 2.0
		s = 1.0 - s
	}
	return lerp (x, y, s)
}

const RX_INT = /^[-+]?0*(\d+)$/
/**
 * Strict 53-bit int test. Returns true if the given string will
 * parse as a valid 53-bit int.
 */
export function stringIsInt53 (s: string) {
	if (typeof s !== 'string') return false
	const match = RX_INT.exec(s)
	return !!match && Math.abs(+match[1]) < Math.pow(2, 53)
}

/**
 * Strict 53-bit int parser. Returns a number only if the supplied
 * string parses as a valid 53-bit int, otherwise undefined.
 */
export function parseInt53 (s: string) {
	if (!stringIsInt53(s)) return undefined
	return Number.parseInt(s, 10)
}
