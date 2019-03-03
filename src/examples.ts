import WaveUrl from './Wave/WaveUrl'

const examples = {
'Hello Sine Wave': {language: 'glsl', start: 0, duration: 2000, source:
`// Note: generated waveforms can be very loud!
// Keep your volume low.
//
// This script must include the function 'mainSound' which
// accepts a number (time in seconds) and returns a
// number (the sample value) between -1.0 and 1.0.
//
// Here is an example that creates a simple sine wave at
// 261.6 Hz (middle C.)

float mainSound (float time) {
	return sin(261.6 * PI2 * time);
}

// Click the play button to hear this wave.
//
// There are several helper functions available to make things easier.
// Click the "?" to the right to see a list of examples.`},

'Easier Sine Wave': {language: 'glsl', start: 0, duration: 2000, source:
`// This example shows the equivalent of the previous:
//   sin(time * 2.0 * PI2 * 261.6)
// by using the provided oscillator function 'sine'.
// Oscillator functions accept a frequenzy parameter (Hz).
// Here we're also making use of a predefined note constant:
//   #define C4 261.6
// All note frequencies from C0 to B8 are defined,
// including sharps (eg. Fs5) and flats (eg. Bb3).
// Oscillator functions can make implicit use of time (t).

float mainSound (float time) {
	return sine(C4); // 261.6 Hz
}

// Oscillators also accept a time parameter if you
// prefer to control time:
// sine(261.6, pow(time, 1.5));`},

Triangle: {language: 'glsl', start: 0, duration: 2000, source:
`// A Triangle Wave

float mainSound (float time) {
	return triangle(261.6); // C4
}`},

Square: {language: 'glsl', start: 0, duration: 2000, source:
`// A Square Wave

float mainSound (float time) {
	return square(261.6);
}`},

Sawtooth: {language: 'glsl', start: 0, duration: 2000, source:
`// A Sawtooth Wave

float mainSound (float time) {
	return sawtooth(261.6);
}`},

Noise: {language: 'glsl', start: 0, duration: 2000, source:
`// Noise

float mainSound (float time) {
	return noise(15000.0) * 0.5;
}`,

'Simple Fading':
`// Simple Fade-out

float mainSound (float time) {
	return triangle(261.6) * exp(-3.0 * time);
}

// Or try using the fadeOut helper:
//   return triangle(261.6) * fadeOut(0.0, 2.0, 4.0);
// where the parameters are: (startTime, endTime, exponent=1)`},

'Simple Envelope': {language: 'glsl', start: 0, duration: 1000, source:
`// Simple envelope
// Using the fadeIn/fadeOut helpers
float mainSound (float time) {
	return triangle(261.6)
		* fadeIn(0.025, 0.05, 0.5)
		* fadeOut(0.05, 2.0, 4.0);
}`},

Chord:  {language: 'glsl', start: 0, duration: 1000, source:
`// Chord with envelope

float chord (float hz, float t) {
	// 12 notes in an octave
	float v = square(hz, t)
		+ triangle(hz * pow(2.0, 1.0 + 4.0 / 12.0), t)
		+ sawtooth(hz * pow(2.0, 1.0 + 7.0 / 12.0), t)
		+ sine(hz * 2.0, t);
	return v / 4.0;
}

float chord (float hz) {
	return chord (hz, time);
}

float mainSound (float t) {
	return chord(C3)
		* fadeIn(0.025, 0.05, 0.5)
		* fadeOut(0.05, 2.0, 4.0);
}`},

'Tom (drum)': {language: 'glsl', start: 0, duration: 250, source:
`float tom(float hz, float time) {
	return mix(
		mix(
			sine(hz + 100.0 * exp(-20.0 * time), time) * exp(-20.0 * time),
			sine(hz + 1000.0 * exp(-25.0 * time), time) * exp(-25.0 * time),
			0.4
		),
		drand(time, time) * exp(-20.0 * time),
		0.05
	);
}

float mainSound (float time) {
	return tom(A3, time);
}`}

/*
Chord:
`// W.chord allows you to create a chord, starting at the
// provided note or frequency.

return W.chord(W.sine, '3C')`,

'Chord fade-in-out':
`// Play a chord with fast fade-in and long fade out
// Oscillators should usually be faded in or out to avoid
// a 'click' sound when they start or end.

return W.chord(W.triangle, '3A')
	* W.fadeIn(0, 0.025, 0.5) * W.fadeOut(d * 0.025, d, 2)`,

Choppy:
`// Make a choppy, rising dissonant chord sound that fades out
// Base frequency of chord
const hz = W.note['1B']
const chord = W.chord(W.square, Math.pow(t * hz, 1.125))
// Frequency of chop effect
const chop = W.chop(20)
// Resulting sample value
let v = chord * chop
// Fade over time
v = v * W.fadeIn(0, 0.02) * W.fadeOut(0.5, d, 2)

return v`,

Explosion:
`// Explosion effect using noise
// Several noises with different pitches and envelopes

const hi = W.noise(10000)
	* W.fadeIn(0, 0.1) * W.fadeOut(0.05, d, 4)
const md = W.noise(3000)
	* W.fadeIn(0, 0.05) * W.fadeOut(0.05, d, 6)
const lo = W.noise(300)
	* W.fadeIn(0, 0.01) * W.fadeOut(0.05, d, 24)

return (hi + md + lo) / 3`
*/
}

type ExampleKey = keyof typeof examples

type Examples = Record<ExampleKey, WaveUrl>

export default examples as Examples
