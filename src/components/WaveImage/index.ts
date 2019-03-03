import m from 'mithril'
import Stream from 'mithril/stream'
import {clamp} from '../../lib/math'
import Ptr from '../../lib/Ptr'
import Wave from '../../Wave'
import * as draw from '../../Wave/draw'
import TimeAxis from './TimeAxis'

/** Use as a placeholder until canvas width is known */
const DEFAULT_CANVAS_WIDTH = 640
const DEFAULT_CANVAS_HEIGHT = 80
const DEFAULT_SAMPLE_RATE = 44100

export interface Attrs {
	wave?: Wave
	fgcolor: string
	bgcolor: string
	onChange?(d: {offset: number, scale: number}): void
}

export default function WaveImage(): m.Component<Attrs> {
	let canvas: HTMLCanvasElement
	let context2d: CanvasRenderingContext2D
	let elPlayHead: HTMLElement
	let ptr: Ptr
	let wave: Wave | undefined
	let playFrame$: Stream<Wave.Event> | undefined
	let fgcolor = '#AAAAAA'
	let bgcolor = '#222222'

	const viewPort$: Stream<draw.WaveViewPort> = Stream({
		scale: 2 / DEFAULT_CANVAS_WIDTH,
		offset: 0,
		width: DEFAULT_CANVAS_WIDTH,
		height: DEFAULT_CANVAS_HEIGHT,
		sampleRate: DEFAULT_SAMPLE_RATE
	})

	// Axis times should be offset by wave start time
	const axisViewPort$ = viewPort$.map(vp => ({
		...vp,
		offset: vp.offset + (wave ? wave.start : 0)
	}))

	function drawWave() {
		if (wave) {
			draw.drawWave({
				context2d,
				wave,
				fgcolor, bgcolor,
				viewPort: viewPort$()
			})
		}
	}

	/* Schedule a redraw */
	//const qdrawWave = throttleWait(drawWave, 16)

	function resize() {
		const rc = canvas.getBoundingClientRect()
		const iw = Math.round(rc.width)
		const ih = Math.round(rc.height)
		if (iw !== canvas.width || ih !== canvas.height) {
			canvas.width = iw
			canvas.height = ih
		}
		viewPort$({...viewPort$(), width: iw, height: ih})
		drawWave()
	}

	function playheadX (t: number) {
		if (!wave) return 0
		const vp = viewPort$()
		return (t - vp.offset) / vp.scale
	}

	function renderPlayhead (t: number) {
		if (!wave || wave.playState() === Wave.STOPPED) {
			elPlayHead.style.transform = `translateX(-100%)`
		} else {
			const x = playheadX(t)
			elPlayHead.style.transform = `translateX(${x}px)`
		}
	}

	/** Call when Wave object has changed */
	function updateWave (w: Wave | undefined) {
		if (playFrame$ !== undefined) {
			playFrame$.end(true)
			playFrame$ = undefined
		}
		wave = w
		if (wave != null) {
			if (wave.buffer.sampleRate !== viewPort$().sampleRate) {
				viewPort$({...viewPort$(),
					sampleRate: wave.buffer.sampleRate
				})
			}
			playFrame$ = wave.on(/*'playframe'*/).map(e => {
				const t = e.type === 'stop' ? 0 : e.time
				renderPlayhead(t)
			})
		}
	}

	/** Returns true if any attrs changed */
	function updateAttrs (a: Attrs) {
		if (wave === a.wave && fgcolor === a.fgcolor && bgcolor === a.bgcolor) {
			return false
		}
		fgcolor = a.fgcolor
		bgcolor = a.bgcolor
		if (wave !== a.wave) {
			updateWave(a.wave)
		}
		return true
	}

	/** Zoom by some delta (eg 1 or -1) */
	function zoomWave (deltaScale: number, offset: number) {
		if (wave == null || deltaScale === 0) {
			return
		}
		const vp = viewPort$()
		if ((vp.scale <= 1 / wave.buffer.sampleRate && deltaScale < 0) || (vp.scale >= wave.duration / vp.width && deltaScale > 0)) {
			return
		}
		// TODO: Fix this sketchy mutation... scale is used in drawWave
		// but we want to defer updating the stream until after it's drawn.
		vp.scale = clamp(
			vp.scale * (1 + deltaScale * 0.125),
			1 / wave.buffer.sampleRate,
			wave.duration / vp.width
		)
		vp.offset = Math.max(0, vp.offset - offset * deltaScale * 0.125)
		drawWave()
		viewPort$({...viewPort$()})
	}

	function onWheel (e: WheelEvent & {redraw: false}) {
		e.redraw = false
		if (!wave) return
		const offset = e.clientX * viewPort$().scale
		zoomWave(Math.sign(e.deltaY), offset)
	}

	/** Set up abstracted pointer event listeners, respond to events */
	function initPtr() {
		if (ptr) {
			throw new Error('Ptr already initialized')
		}
		let xDrag0: number | undefined
		ptr = Ptr(canvas, {
			onDown: e => {
				xDrag0 = e.x
			},
			onMove: e => {
				if (!wave) return
				const vp = viewPort$() // tslint:disable-line no-shadowed-variable
				const dx = xDrag0 != null ? -(e.x - xDrag0) : 0
				const o = clamp(
					vp.offset + dx * vp.scale,
					0, wave.duration
				)
				if (o !== vp.offset) {
					vp.offset = o
					drawWave()
					xDrag0 = e.x
					viewPort$({...viewPort$(), offset: o})
				}
			}
		})
	}

	return {
		oncreate: ({attrs, dom}) => {
			// 'ready' the dom first
			canvas = dom.querySelector('canvas.wave-image') as HTMLCanvasElement
			elPlayHead = dom.querySelector('.wave-playhead') as HTMLElement

			const canvasElWidth = canvas.getBoundingClientRect().width
			// TODO: Clean up sketchy mutations...
			const vp = viewPort$()
			vp.width = canvasElWidth
			vp.scale = (wave ? wave.duration : 2) / vp.width
			console.log('viewPort:', vp)

			context2d = canvas.getContext('2d')!

			// This will setup the wave if we get one
			updateAttrs(attrs)

			resize()
			//requestAnimationFrame(resize) // resize()
			window.addEventListener('resize', resize)

			initPtr()

			/* const hammer = new Hammer(canvas)
			hammer.get('pinch').set({enable: true})
			hammer.on('pinch', e => {
				console.log('pinch', e)
			})
			//hammer.get('pan').set({enable: true})
			let prevPanX: number | undefined
			hammer.on('panstart', e => {
				prevPanX = -e.deltaX
			})
			hammer.on('pan', e => {
				const dx = prevPanX != null ? (-e.deltaX) - prevPanX : 0
				waveOffset = clamp(waveOffset + (0.05 / waveScale) * dx / wave.buffer.sampleRate, 0, 100)
				drawWave()
				prevPanX = dx
				console.log('pan', dx, wave.buffer.sampleRate)
			}) */
		},
		onbeforeupdate: ({attrs}) => {
			if (updateAttrs(attrs)) {
				requestAnimationFrame(drawWave)
			}
		},
		onremove: () => {
			window.removeEventListener('resize', resize)
			ptr.destroy()
		},
		view: v => m('.wave-viewer',
			m('canvas.wave-image', {
				style: 'height: 5em; width: 100%;',
				tabindex: 0,
				onwheel: onWheel
			}),
			m('.wave-footer',
				wave && m(TimeAxis, {viewPort$: axisViewPort$})
			),
			m('.wave-playhead'),
			v.children
		)
	}
}
