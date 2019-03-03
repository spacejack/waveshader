export function createContext() {
	try {
		const canvas = document.createElement('canvas')
		return canvas.getContext('webgl')
			|| canvas.getContext('experimental-webgl')
			|| undefined
	} catch (e) {
		return undefined
	}
}

let gl: WebGLRenderingContext | undefined

export function getContext() {
	gl = gl || createContext()
	if (!gl) {
		throw new Error('Cannot create WebGL context')
	}
	return gl
}
