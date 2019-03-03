///<reference path="../../types/gl-shader-output.d.ts"/>
import Shader from 'gl-shader'
import createShaderOutput from 'gl-shader-output'
import * as shaders from './shaders'

export interface ProcessOptions {
	/**
	 * User script that implements the function `float mainSound(float time)`
	 */
	script: string
	/** Time offset for shader */
	time: number
	/** Total number of samples to process */
	samples: number
	/** Sample rate/second */
	sampleRate: number
	/** Number of channels. */
	channels: 1 | 2 | 3 | 4
	/**
	 * Array of typed array(s) to hold output.
	 * Provide as many arrays as there are channels.
	 * You must pre-allocate the typed arrays.
	 */
	outputs: Float32Array[]
}

/** @returns A power-of-2 number that fits n (plus any extra) */
function potFit (n: number) {
	const target = Math.sqrt(n)
	const EMAX = 14
	for (let e = 1; e < EMAX; ++e) {
		const test = Math.floor(Math.pow(2, e))
		if (test >= target) {
			return test
		}
	}
	return Math.floor(Math.pow(2, EMAX))
}

/**
 * Generate wave data given the input struct.
 * Output is written to the `outputs` array.
 * Returns the complete GLSL source.
 */
export function process (
	gl: WebGLRenderingContext, {
		script, time, samples, sampleRate, channels, outputs
	}: ProcessOptions
) {
	if (channels > outputs.length) {
		throw new Error(`Not enough outputs for ${channels} channels`)
	}
	for (let i = 0; i < channels; ++i) {
		if (outputs[i].length < samples) {
			console.warn(`Provided output array is too small for ${samples} samples`)
		}
	}
	console.log(`processing ${samples} samples`)
	if (!script) {
		const vecType = channels === 1 ? 'float' : `vec${channels}`
		script = `${vecType} mainSound (float time) {
			return ${vecType}(sin(6.2831 * 440.0 * time) * exp(-3.0 * time));
		}`
	}
	// Use a fixed PoT width and variable height to accommodate sample data
	const rowWidth = 256 // TODO: Try to make a PoT rectangle? potFitRect(samples)
	const rowCount = Math.ceil(samples / rowWidth)
	console.log(`Sound rendering context size: ${rowWidth}x${rowCount}`)
	// Create a shader and a helper to read the results
	const fullSource = shaders.fragment(script, channels)
	const shader = Shader(gl, shaders.vertex(), fullSource)
	const draw = createShaderOutput(shader, {
		width: rowWidth,
		height: rowCount
	})

	// Run it
	const d = new Date()
	// TODO: Why is the first sample for time = 0 + some_error
	const result = draw({
		// uniforms named by ShaderToy convention
		iResolution: [rowWidth, rowCount, 1],
		iSampleRate: sampleRate,
		iGlobalTime: time,
		// iFrame: 0, // ??
		iDate: [
			d.getFullYear(), // the year (four digits)
			d.getMonth(), // the month (from 0-11)
			d.getDate(), // the day of the month (from 1-31)
			d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds()
		]
	})

	console.log('output size (bytes): ', result.length)
	console.log('excess: ', result.length - samples * 4)

	// Copy results to outputs (color channel per audio channel)
	for (let channel = 0; channel < channels; channel++) {
		const output = outputs[channel]
		for (let i = 0; i < samples; i++) {
			output[i] = result[i * 4 + channel]
		}
	}

	return fullSource
}
