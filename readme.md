# WaveShader

### [⮞ Run WaveShader](https://spacejack.github.io/waveshader/)

---

WaveShader is a sketchpad for writing functions that generate audio waves and for visualizing those waveforms. You can export and save sounds as .WAV files. You can also save/link to a sketch by clicking the share button and copying the URL.

Wave functions are written in GLSL - the OpenGL shader language.

If a wave generation function is expressed in the form:

```glsl
amplitude = f(time)
```

it can be easily parallelized. And because it's pure number crunching, it's a perfect candidate for the GPU, by way of WebGL.

I should note that mid-way into development I discovered that [ShaderToy](https://www.shadertoy.com/) was already doing this very thing, though its UI is geared more toward creating visuals than shaping audio waves. WaveShader borrows some naming conventions to make it a bit easier to be able to write similar code in both.

Note that for the sake of quick prototyping, WaveShader does not buffer wave generation/playback, so sound duration is limited to 60 seconds for now. This was originally conceived as a tool for sketching tones, sound effects and for visualization rather than for composing full tracks.

Only single-channel audio is supported for now.

---

## Local Development Install

	npm install

### Recommended VSCode Extensions

* tslint
* eslint
* stylelint
* postcss-sugarss-language
* EditorConfig

(Or equivalents for your preferred editor/IDE.)

## Run & Develop

	npm start

Then go to http://localhost:3000 in your browser

## Build Minified

	npm run build

Outputs compiled JS to `public/js` and CSS to `public/css`.

---

© 2019 by spacejack

Built with:

* Mithril
* stackgl
* CodeMirror

## References

This was a very helpful resource for getting output data from shaders: https://github.com/audiojs/audio-shader
