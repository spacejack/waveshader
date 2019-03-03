import {
	compressToEncodedURIComponent, decompressFromEncodedURIComponent
} from 'lz-string'

/** Represents the data structure encoded in a url */
interface WaveUrl {
	language: string
	source: string
	start: number
	duration: number
}

const MAX_HEADER_LENGTH = 100

namespace WaveUrl {
	/** Pack into a URL-safe text blob */
	export function serialize (opts: WaveUrl) {
		if (!opts.language
			|| !opts.source
			|| !Number.isSafeInteger(opts.start)
			|| !opts.duration || !Number.isSafeInteger(opts.duration)
			|| opts.start < 0 || opts.duration < 1
		) {
			throw new Error("Invalid param: " + JSON.stringify(opts))
		}
		const head = `ws1\t${opts.language}\t${opts.duration}\t${opts.start}\n`
		if (head.length > MAX_HEADER_LENGTH) {
			throw new Error('Header too long')
		}
		const src = head + opts.source
		return compressToEncodedURIComponent(src)
	}

	/** Unpack from a URL-safe text blob */
	export function deserialize (url: string): WaveUrl {
		if (!url || typeof url !== 'string') {
			throw new Error("Invalid parameter")
		}
		const src = decompressFromEncodedURIComponent(url)
		const i = src.indexOf('\n')
		if (i < 0 || i > MAX_HEADER_LENGTH) {
			throw new Error("Invalid URL")
		}
		const header = src.substr(0, i)
		const parts = header.split('\t')
		// TODO: make start param required?
		if (parts.length < 3 || parts[0] !== 'ws1') {
			throw new Error("Invalid URL header")
		}

		const language = parts[1]
		if (language !== 'glsl') {
			throw new Error("Unsupported language")
		}

		let duration = Number(parts[2])
		if (!Number.isFinite(duration) || duration < 1) {
			duration = 2000
		}
		duration = Math.min(duration, 99999)

		let start = Number(parts[3])
		if (!Number.isFinite(start) || start < 0) {
			start = 0
		}
		start = Math.min(start, 99999)

		const source = src.substr(i + 1)
		return {
			language, source, start, duration
		}
	}

	/** Try to parse a WaveUrl object from the browser location hash */
	export function fromLocationHash (hash: string) {
		let waveUrl: WaveUrl | undefined
		const url = hash.slice(1).trim()
		if (url) {
			try {
				waveUrl = WaveUrl.deserialize(url)
			} catch (err) {
				console.warn('Failed to parse URL: ' + err.message)
			}
		}
		return waveUrl
	}
}

export default WaveUrl
