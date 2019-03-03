import {roundFrac} from '../../lib/math'
import {NOTES} from './notes'

export const vertex = () => `precision highp float;
precision highp int;
attribute vec2 position;
uniform float iGlobalTime;
uniform float iSampleRate;
uniform vec3  iResolution;
varying float time;
void main (void) {
	gl_Position = vec4(position, 0, 1);
	vec2 p = vec2(position.x * 0.5 + 0.5, position.y * 0.5 + 0.5);
	time = iGlobalTime + (
		p.y * iResolution.x * iResolution.y
		+ p.x * iResolution.x
	) / iSampleRate;
}`

const noteDefines = Object.keys(NOTES).map(
	k => `#define ${k} ${roundFrac(NOTES[k], 2)}`
).join('\n')

export const fragment = (script: string, channels: number = 1) => `precision highp float;
precision highp int;
uniform vec3      iResolution;           // viewport resolution (in pixels)
uniform float     iGlobalTime;           // shader playback time (in seconds)
// uniform int       iFrame;                // shader playback frame
uniform vec4      iDate;                 // (year, month, day, time in seconds)
uniform float     iSampleRate;           // sound sample rate (i.e., 44100)
// uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
// uniform sampler2D iChannel0;             // input channel1
// uniform sampler2D iChannel1;             // input channel2
// uniform sampler2D iChannel2;             // input channel3
// uniform sampler2D iChannel3;             // input channel4
varying float time;

// Useful constants

const float PI = 3.141592653589793;
const float PI2 = PI * 2.0;

// Helper functions

float round (float n) {
	return sign(n) * floor(abs(n) + 0.5);
}

float drand (float x, float y) {
	return abs(mod((sin(dot(vec2(x, y), vec2(12.9898, 78.233))) * 43758.5453), 1.0));
}

float sine (float hz, float t) {
	return sin(t * hz * 2.0 * PI);
}

float sine (float hz) {
	return sine(hz, time);
}

float triangle (float hz, float t) {
	float s = mod((t * hz), 1.0);
	return s < 0.5
		? s * 4.0 - 1.0
		: (1.0 - 2.0 * (s - 0.5)) * 2.0 - 1.0;
}

float triangle (float hz) {
	return triangle(hz, time);
}

float sawtooth (float hz, float t) {
	return mod((t * hz), 1.0) * 2.0 - 1.0;
}

float sawtooth (float hz) {
	return sawtooth(hz, time);
}

float square (float hz, float t) {
	return round(mod(t * hz, 1.0)) * 2.0 - 1.0;
}

float square (float hz) {
	return square(hz, time);
}

float noise (float hz, float t) {
	float thz = hz * t;
	float i0 = floor(thz);
	float i1 = ceil(thz);
	float v0 = drand(hz, i0);
	float v1 = drand(hz, i1);
	return mix(v1, v0, mod(thz, 1.0)) * 2.0 - 1.0;
}

float noise (float hz) {
	return noise(hz, time);
}

float fadeIn (float start, float end, float e, float t) {
	return pow(
		clamp((t - start) / (end - start), 0.0, 1.0), e
	);
}

float fadeIn (float start, float end, float e) {
	return fadeIn(start, end, e, time);
}

float fadeIn (float start, float end) {
	return fadeIn(start, end, 1.0, time);
}

float fadeOut (float start, float end, float e, float t) {
	return pow(
		clamp(1.0 - (t - start) / (end - start), 0.0, 1.0), e
	);
}

float fadeOut (float start, float end, float e) {
	return fadeOut(start, end, e, time);
}

float fadeOut (float start, float end) {
	return fadeOut(start, end, 1.0, time);
}

// Identifiers for 8 octaves of note frequencies

${noteDefines}

// Your script starts here....
/////////////////////////////////////////////////
${script}
/////////////////////////////////////////////////

// Shader entry point
void main (void) {
	gl_FragColor = vec4(mainSound(time)${
		channels === 1 ? ', 0, 0, 0' :
		channels === 2 ? ', 0, 0' :
		channels === 3 ? ', 0' :
		''
	});
}`

/*
float toBeat16Time(float note, float time) {
    float t = time - note * (60.0 / (BPM * 4.0));
    return t > 0.0 ? t : 10000.0;
}

vec2 snare(float time) {
	return vec2(mix(
    	distort(triangle(50.0 + 400.0 * exp(-40.0 * time), time) * exp(-50.0 * time), 1.2),
        random(time) * exp(-16.0 * time),
        0.5
    ));
}

float tom(float hz, float time) {
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

vec2 tom(float time) {
	return vec2(mix(
        mix(
       		sine(200.0 + 100.0 * exp(-20.0 * time), time) * exp(-20.0 * time),
        	sine(200.0 + 1000.0 * exp(-25.0 * time), time) * exp(-25.0 * time),
            0.4
        ),
        random(time) * exp(-20.0 * time),
        0.05
	));
}

vec2 openhihat(float time) {
	return vec2(mix(
    	triangle(1000.0 + 2000.0 * exp(-100.0 * time), time) * exp(-100.0 * time),
        random(time) * exp(-10.0 * time),
        0.5
    ));
}

vec2 cymbal(float time) {
	return vec2(mix(
    	triangle(7000.0, time) * exp(-20.0 * time),
        random(time) * exp(-20.0 * time),
        0.2
    ));
}
*/
