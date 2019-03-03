import Stream from 'mithril/stream'
import {dropInitial, filterStream} from '../lib/stream'
import {concatTyped} from '../lib/array'
import * as audio from '../lib/audio'
import * as webgl from '../lib/webgl'
import * as WaveShader from './WaveShader'

interface Wave {
	readonly source: string
	readonly fullSource: string
	readonly sourceError: Error | undefined
	readonly buffer: AudioBuffer
	/** Duration in seconds (positive only) */
	readonly duration: number
	/** Offset from 0 in seconds (positive only) */
	readonly start: number
	play(): Promise<void>
	stop(): void
	playState(): Wave.PlayState
	playTime(): number | undefined
	on(type?: Wave.EventType): Stream<Wave.Event>
	off(emitter: Stream<Wave.Event>): void
	toWavBuffer(): Uint8Array
}

function Wave (opts: Wave.Options): Wave {
	const duration = opts.durationMs / 1000
	const start = opts.startMs / 1000
	const events = Stream<Wave.Event>()
	let buffer!: AudioBuffer
	let bs: AudioBufferSourceNode | undefined
	let fullSource = ''
	let sourceError: Error | undefined
	let playPromise: Promise<void> | undefined
	let playState: Wave.PlayState = Wave.STOPPED
	let playStartT: number | undefined

	function init() {
		console.log(`Creating a wave ${duration.toFixed(3)}s long`)
		const ac = audio.context()
		const numSamples = Math.floor(duration * ac.sampleRate)
		const a = new Float32Array(numSamples)
		// Run GLSL script. Result data is written into outputs arrays
		try {
			fullSource = WaveShader.process(webgl.getContext(), {
				script: opts.source,
				time: start,
				samples: numSamples,
				sampleRate: ac.sampleRate,
				channels: 1,
				outputs: [a]
			})
		} catch (err) {
			sourceError = err
		}
		buffer = audio.createBufferFromData(a)
	}
	init()

	function play() {
		if (!playPromise) {
			playPromise = new Promise<void>(r => {
				bs = audio.createBufferSource(buffer)
				bs.start()
				playState = Wave.PLAYING
				playStartT = Date.now()
				requestAnimationFrame(playFrame)
				bs.addEventListener('ended', function cb() {
					bs && bs.removeEventListener('ended', cb)
					const t = playStartT!
					playPromise = undefined
					playState = Wave.STOPPED
					playStartT = undefined
					events({type: 'stop', time: (Date.now() - t) / 1000})
					r()
				})
			})
			events({type: 'play', time: 0})
		} else {
			console.log('Already playing this Wave')
		}
		return playPromise
	}

	function playFrame() {
		if (playState !== Wave.PLAYING || playStartT == null) {
			return
		}
		events({type: 'playframe', time: (Date.now() - playStartT) / 1000})
		requestAnimationFrame(playFrame)
	}

	function stop() {
		bs && bs.stop()
		// stop() will fire the event that resolves the promise
		playPromise = undefined
		playState = Wave.STOPPED
	}

	function on (type?: Wave.EventType) {
		//return events.map(e => e)
		const emitter = dropInitial(events)
		return type
			? filterStream((e: Wave.Event) => e.type === type, emitter)
			: emitter
	}

	function off (emitter: Stream<Wave.Event>) {
		emitter.end(true)
	}

	/** Returns a complete .wav file binary as an array */
	function toWavBuffer(): Uint8Array {
		const fileHeader = audio.createWavFileHeader({
			bytesPerSample: 2,
			numChannels: buffer.numberOfChannels as 1,
			numFrames: buffer.length,
			sampleRate: buffer.sampleRate
		})
		const fh8 = new Uint8Array(fileHeader)
		// Convert samples to 16-bit signed ints
		const wdata = new Int16Array(buffer.length)
		const ab = buffer.getChannelData(0)
		for (let i = 0; i < buffer.length; ++i) {
			wdata[i] = Math.floor(ab[i] * 32768)
		}
		return new Uint8Array(concatTyped(fh8, wdata))
	}

	return {
		source: opts.source,
		fullSource,
		sourceError,
		buffer,
		start, duration,
		play, stop,
		playState: () => playState,
		playTime: () => playStartT != null ? Date.now() - playStartT : undefined,
		on, off,
		toWavBuffer
	}
}

namespace Wave {
	export type PlayState = 0 | 1 | 2
	export const STOPPED = 0
	export const PLAYING = 1
	export const PAUSED  = 2

	export type EventType = 'play' | 'stop' | 'playframe'

	export interface Event {
		type: EventType
		time: number
	}

	export interface Options {
		/** GLSL user source */
		source: string
		/** Duration in milliseconds */
		durationMs: number
		/** Start time offset in milliseconds */
		startMs: number
	}
}

export default Wave
