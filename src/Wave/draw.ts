import {clamp} from '../lib/math'
import Wave from '.'

export interface WaveViewPort {
	/** Sample rate (eg 44100) */
	sampleRate: number
	/** Left edge time in seconds */
	offset: number
	/** Seconds/pixel */
	scale: number
	/** Width of canvas in pixels */
	width: number
	/** Height of canvas in pixels */
	height: number
}

export interface DrawWaveOptions {
	wave: Wave
	context2d: CanvasRenderingContext2D
	fgcolor: string
	bgcolor: string
	viewPort: WaveViewPort
}

/**
 * Draw the wave using the supplied context2d.
 * TODO: Make this a shader?
 */
export function drawWave(
	{wave, context2d: c, fgcolor, bgcolor, viewPort: vp}: DrawWaveOptions
) {
	const VSCALE = 0.925
	const bs = wave.buffer.getChannelData(0)
	const sampleRate = wave.buffer.sampleRate
	if (bs.length < 1 || vp.width < 1) {
		console.warn('No wave data to draw')
		return
	}
	c.fillStyle = bgcolor
	c.fillRect(0, 0, vp.width, vp.height)

	// Draw the red line 0
	c.lineWidth = 1
	c.strokeStyle = 'rgba(255,0,0,0.125)'
	c.beginPath()
	c.moveTo(0, vp.height / 2)
	c.lineTo(vp.width, vp.height / 2)
	c.stroke()

	// Draw the wave
	c.strokeStyle = fgcolor
	c.beginPath()
	c.moveTo(0, Math.floor(((bs[0] * vp.height * VSCALE) + vp.height) / 2))
	// Draw up to 4 line segments per horizontal pixel to fill a bit better
	for (let x = 0, xstep = clamp(1 / (vp.scale * sampleRate), 0.25, 1); x < vp.width; x += xstep) {
		const iStart = Math.floor(vp.offset * sampleRate + x * vp.scale * sampleRate)
		const v = bs[iStart]
		const y = vp.height - 1 - Math.floor(((v * vp.height * VSCALE) + vp.height) / 2)
		c.lineTo(x, y)
	}
	c.stroke()
}
