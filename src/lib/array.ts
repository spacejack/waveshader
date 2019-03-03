/** Generate an array sequence of num numbers starting from 0 incrementing by 1 */
export function range (num: number): number[]
/** Generate an array sequence of numbers starting from start up to but not including end, incrementing by 1 */
export function range (start: number, end: number): number[]
/** Generate an array sequence of numbers from start up to but not including end incrementing by step */
export function range (start: number, end: number, step: number): number[]

export function range (start: number, end?: number, step?: number): number[] {
	step = step || 1
	if (end == null) {
		end = start
		start = 0
	}
	const size = Math.ceil((end - start) / step)
	const a: number[] = []
	for (let i = 0; i < size; ++i) {
		a.push(start + step * i)
	}
	return a
}

export type TypedArray
	= Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array
	| Float32Array | Float64Array

/** Concatinates N typed arrays into a result ArrayBuffer */
export function concatTyped(...typedArrays: TypedArray[]): ArrayBuffer {
	// Get a Uint8 view for all arrays
	const arrays = typedArrays.map(a => new Uint8Array(a.buffer))
	const totalLength = arrays.reduce((l, a) => l + a.length, 0)
	const result = new Uint8Array(totalLength)
	let offset = 0
	for (const arr of arrays) {
		result.set(arr, offset)
		offset += arr.length
	}
	return result.buffer
}
