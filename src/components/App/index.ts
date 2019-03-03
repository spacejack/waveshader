import m from 'mithril'
import CodeMirror from 'codemirror'
import 'codemirror/mode/clike/clike'
import {BASE_URL} from '../../config'
import {throttleWait} from '../../lib/throttle'
import * as audio from '../../lib/audio'
import HyperSVG, {HyperScript} from '../../lib/hypersvg'
const hs = HyperSVG(m as HyperScript)
import Wave from '../../Wave'
import Timespan from '../../Wave/Timespan'
import WaveUrl from '../../Wave/WaveUrl'
import {THEMES, applyTheme, themeColorStr} from '../../theme'
import {state, actions} from '../../state'
import examples from '../../examples'
import WaveImage from '../WaveImage'
import HelpPanel from '../HelpPanel'
import SharePanel from '../SharePanel'
import TimespanInput from '../TimespanInput'

const defaultSource = examples['Hello Sine Wave'].source

export interface Attrs {
	/** Initial WaveUrl object (optional) */
	waveUrl?: WaveUrl
}

/**
 * Root application component
 */
export default function App(): m.Component<Attrs> {
	let source = defaultSource
	let startMs = 0
	let durationMs = 2000
	let playing = false
	let helpOpen = false
	let shareOpen = false
	let shareUrl: string | undefined
	//let cmTheme = 'shadowfox'
	// Deferred inits...
	let wave: Wave | undefined
	let cm: CodeMirror.EditorFromTextArea // in oncreate
	let cmDom: HTMLTextAreaElement // CodeMorror dom node

	/**
	 * Handle window resizing.
	 */
	function resize() {
		//const h = dom.getBoundingClientRect().height
		cm.refresh()
	}

	/** Throttled Wave update */
	const updateWave: (opts: Wave.Options) => void = throttleWait(
		(opts: Wave.Options) => {
			wave = Wave(opts)
			Promise.resolve().then(m.redraw)
		}
	)

	/** Updates source, immediately updates wave */
	function updateSource (src: string) {
		source = src
		cm.setValue(source)
		wave = Wave({source, durationMs, startMs})
	}

	/** Plays the wave and starts the playhead animation */
	function playWave() {
		if (!wave) return
		wave.play().then(() => {
			if (playing) {
				playing = false
				m.redraw()
			}
		})
		playing = true
	}

	function stopWave() {
		playing = false
		wave && wave.stop()
	}

	/** Prepare a .wav file download for when the link is clicked */
	function downloadWav (a: HTMLAnchorElement) {
		if (!wave) return
		const blob = new Blob([wave.toWavBuffer()], {
			type: "application/octet-stream"
		})
		const downloadUrl = URL.createObjectURL(blob)
		a.setAttribute('href', downloadUrl)
		const filename = `wave-${Math.floor(Date.now() / 1000)}.wav`
		a.setAttribute('download', filename)
	}

	/** Hash url changed, try to parse GLSL source */
	function onHashChange (e: HashChangeEvent) {
		const url = window.location.hash.slice(1).trim()
		if (!url) {
			return
		}
		console.log('Url changed, attempting to parse...')
		let w: WaveUrl
		try {
			w = WaveUrl.deserialize(url)
		} catch (err) {
			console.warn('Failed to parse URL: ' + err.message)
			return
		}
		startMs = w.start
		durationMs = w.duration
		updateSource(w.source)
		m.redraw()
	}

	function setTheme (theme: string) {
		actions.setTheme(theme)
		cm.setOption('theme', theme)
		applyTheme(theme)
	}

	return {
		oninit: v => {
			if (v.attrs.waveUrl != null) {
				source = v.attrs.waveUrl.source
				startMs = v.attrs.waveUrl.start
				durationMs = v.attrs.waveUrl.duration
			}
		},
		oncreate: v => {
			cmDom = v.dom.querySelector('textarea.wave-editor') as HTMLTextAreaElement
			cm = CodeMirror.fromTextArea(cmDom, {
				lineNumbers: true,
				mode: 'clike',
				tabSize: 2,
				theme: state.theme,
				pollInterval: 1000 // for unusual edits that dont fire events
			})
			cm.setSize(null, '100%')
			cm.on('change', (s) => {
				console.log('source changed')
				source = s.getValue()
				updateWave({source, startMs, durationMs})
			})
			cm.setOption('theme', state.theme)
			applyTheme(state.theme)
			requestAnimationFrame(() => {
				resize()
				wave = Wave({source, startMs, durationMs})
				m.redraw()
			})
			window.addEventListener('resize', resize)
			window.addEventListener('hashchange', onHashChange)
		},
		onremove: () => {
			window.removeEventListener('resize', resize)
			window.removeEventListener('hashchange', onHashChange)
		},
		view: () => m('.app.wstheme', {'data-wstheme': state.theme},
			m('.titlebar',
				m('.title',
					m('span', 'WAVE'),
					m('span.shade', 'SHADE')
				),
				m('.play-controls',
					//m('span', {style: 'font-size: 1.5em'}, '🔊 '),
					hs.svgSpeakerIcon({class: 'svg speaker'}),
					m('input', {
						type: 'range',
						min: 0,
						max: 100,
						step: 1,
						title: 'Volume',
						style: {cursor: 'pointer'},
						value: Math.floor(audio.getMasterVolume() * 100),
						onchange: (e: Event) => {
							audio.setMasterVolume(
								Number((e.currentTarget as HTMLInputElement).value) / 100
							)
						}
					}),
					m('button.play',
						{
							type: 'button',
							title: 'Play',
							disabled: playing,
							onclick: playWave
						},
						//'▶' '⏸'
						hs.svg({class: 'svg'}, hs.triangle())
					),
					' ',
					m('button.play',
						{
							type: 'button',
							title: 'Stop',
							disabled: !playing,
							onclick: stopWave
						},
						//'■'
						hs.svg({class: 'svg'}, hs.rect({
							x: 0.1, y: 0.1, width: 0.8, height: 0.8
						}))
					)
				),
				m('.fch',
					m(TimespanInput, {
						start: startMs,
						duration: durationMs,
						onChange: (span: Timespan) => {
							if (span.duration > 0) {
								startMs = span.start
								durationMs = span.duration
								updateWave({source, startMs, durationMs})
							}
						}
					}),
					m('.download',
						m('a.round',
							{
								title: 'Download WAV file',
								onclick: (e: Event) => {
									downloadWav(e.currentTarget as HTMLAnchorElement)
								}
							},
							hs.svgDownloadIcon({class: 'svg'}) //'⭳' , '▼'
						)
					)
				)
			),
			m(WaveImage, {
					wave,
					fgcolor: themeColorStr(state.theme, 'wave'),
					bgcolor: themeColorStr(state.theme, 'bg')
				},
				!!wave && !!wave.sourceError && m('.error-box',
					wave.sourceError.message
				)
			),
			m('.titlebar2',
				m('.content',
					m('span',
						{style: 'color: #999'},
						'Implement this ',
						m('a',
							{
								href: 'https://www.shaderific.com/glsl-functions/',
								rel: 'noopener',
								target: '_blank'
							}, 'GLSL'
						),
						' function: '
					),
					m('span.code', 'float mainSound (float time);')
				),
				m('.fch',
					m('button.round', {
						style: {marginRight: '0.5em'},
						title: shareOpen ? 'Close Share Link' : 'Share Link',
						onclick: () => {
							shareOpen = !shareOpen
							if (shareOpen) {
								shareUrl = BASE_URL + '/#'
									+ WaveUrl.serialize({
										language: 'glsl', source,
										start: startMs, duration: durationMs
									})
							} else {
								shareUrl = undefined
							}
						}
					}, shareOpen ? '×' : '⠪'), // '⠕'), // hs.svgShareIcon()),
					m('button.round', {
						title: helpOpen ? 'Close Info and Options' : 'Info and Options',
						onclick: () => {
							helpOpen = !helpOpen
						}
					}, helpOpen ? '×' : '?')
				)
			),
			m('.wave-editor-block',
				m('textarea.wave-editor', source),
				helpOpen && m(HelpPanel, {
					fullSource: !!wave ? wave.fullSource : '',
					theme: state.theme,
					themes: THEMES.map(t => t.name),
					onSelectExample: (name: keyof typeof examples) => {
						const ex = examples[name]
						updateSource(ex.source)
					},
					onSelectTheme: setTheme
				}),
				shareOpen && shareUrl && m(SharePanel, {
					text: shareUrl
				})
			)
		)
	}
}
