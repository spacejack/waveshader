import {clamp} from './math'

declare global {
	interface Window {
		webkitAudioContext: typeof AudioContext
	}
}

const DEFAULT_VOLUME = 0.25

let masterVolume = DEFAULT_VOLUME
let masterGain: GainNode

/** Create AudioContext with fallback for Webkit */
function createContext() {
	if (typeof AudioContext !== 'undefined') {
		return new AudioContext()
	} else if (window.webkitAudioContext) {
		return new window.webkitAudioContext()
	}
	return undefined
}

/**
 * Returns the AudioContext instance used for this app.
 * Must be created on user interaction.
 */
export const context = (function() {
	let ctx: AudioContext | undefined
	return function context() { // tslint:disable-line no-shadowed-variable
		if (!ctx) {
			if (!(ctx = createContext())) { // tslint:disable-line no-conditional-assignment
				throw new Error('Could not create AudioContext')
			}
			masterGain = ctx.createGain()
			masterGain.gain.setValueAtTime(masterVolume * masterVolume, ctx.currentTime)
			masterGain.connect(ctx.destination)
		}
		return ctx
	}
}())

/**
 * For browsers that require user interaction to enable audio.
 * This should be called by an input event handler.
 */
export function tryEnable() {
	// Create an empty buffer.
	const ctx = createContext()
	if (!ctx) return false
	const source = ctx.createBufferSource()
	source.buffer = ctx.createBuffer(1, 1, 22050)
	source.connect(ctx.destination)

	// Play the empty buffer.
	if (source.start) {
		source.start(0)
	} else {
		// Legacy
		(source as any).noteOn(0)
	}

	// Calling resume() on a stack initiated by user gesture is
	// what actually unlocks the audio on Android Chrome >= 55.
	if (ctx.resume) {
		ctx.resume()
	}
	return true
}

/** Gets master volume */
export function getMasterVolume(): number {
	return masterVolume
}

/** Sets master volume */
export function setMasterVolume (v: number) {
	if (typeof v !== 'number' || !Number.isFinite(v)) {
		throw new Error('Invalid volume value')
	}
	masterVolume = clamp(v, 0, 1)
	if (masterGain != null) {
		masterGain.gain.setValueAtTime(
			// Square it here so we don't have to elsewhere
			masterVolume * masterVolume, context().currentTime
		)
	}
}

/** Creates an AudioBuffer from the supplied array */
export function createBufferFromData (data: Float32Array): AudioBuffer {
	const ac = context()
	const b = ac.createBuffer(1, data.length, ac.sampleRate)
	b.getChannelData(0).set(data)
	return b
}

/**
 * Creates a BufferSourceNode from an AudioBuffer that
 * plays through the master gain
 */
export function createBufferSource (b: AudioBuffer) {
	const ac = context()
	const bs = ac.createBufferSource()
	bs.buffer = b
	bs.connect(masterGain)
	return bs
}

export interface WavFileHeaderOptions {
	numFrames: number
	sampleRate: number
	numChannels: 1 | 2
	bytesPerSample: 1 | 2 | 4
}

/** Creates the bytes for a WAV file header */
export function createWavFileHeader (opts: WavFileHeaderOptions) {
	const blockAlign = opts.numChannels * opts.bytesPerSample
	const byteRate = opts.sampleRate * blockAlign
	const dataSize = opts.numFrames * blockAlign
	const buffer = new ArrayBuffer(44)
	const dv = new DataView(buffer)
	let p = 0

	function writeString (s: string) {
		for (let i = 0; i < s.length; i++) {
			dv.setUint8(p + i, s.charCodeAt(i))
		}
		p += s.length
	}

	function writeUint32 (d: number) {
		dv.setUint32(p, d, true)
		p += 4
	}

	function writeUint16 (d: number) {
		dv.setUint16(p, d, true)
		p += 2
	}

	writeString('RIFF')                  // ChunkID
	writeUint32(dataSize + 36)           // ChunkSize
	writeString('WAVE')                  // Format
	writeString('fmt ')                  // Subchunk1ID
	writeUint32(16)                      // Subchunk1Size
	writeUint16(1)                       // AudioFormat
	writeUint16(opts.numChannels)        // NumChannels
	writeUint32(opts.sampleRate)         // SampleRate
	writeUint32(byteRate)                // ByteRate
	writeUint16(blockAlign)              // BlockAlign
	writeUint16(opts.bytesPerSample * 8) // BitsPerSample
	writeString('data')                  // Subchunk2ID
	writeUint32(dataSize)                // Subchunk2Size

	return buffer
}
