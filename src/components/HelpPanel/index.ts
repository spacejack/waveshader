import m from 'mithril'
import {triggerTransition, transitionPromise} from '../../lib/dom'
import {NOTES} from '../../Wave/WaveShader/notes'
import examples from '../../examples'

const credits = [
	{href: 'https://mithril.js.org/', text: 'Mithril'},
	{href: 'https://github.com/stackgl', text: 'stackgl'},
	{href: 'https://codemirror.net/', text: 'CodeMirror'}
]

function padNote (n: string) {
	return n.length === 3 ? n : n + ' '
}

export interface Attrs {
	fullSource: string
	theme: string
	themes: string[]
	onSelectExample(name: string): void
	onSelectTheme(theme: string): void
}

export default function HelpPanel(): m.Component<Attrs> {
	let noteFreqsOpen = false
	let showGLSL = false

	return {
		oncreate: ({dom}) => triggerTransition(dom, 'open'),
		onbeforeremove: ({dom}) => transitionPromise(dom, 'open'),
		view: ({attrs: {
			fullSource, theme, themes, onSelectExample, onSelectTheme
		}}) => m('.help-panel',
			m('h2', 'Select an example:'),
			m('p',
				m('select',
					{
						onchange: (e: Event) => {
							onSelectExample((e.currentTarget as HTMLSelectElement).value)
						}
					},
					Object.keys(examples).map(k => m('option', {value: k}, k))
				)
			),
			m('h2', 'Note Frequencies'),
			m('p',
				m('a',
					{
						href: '',
						onclick: (e: Event) => {
							e.preventDefault()
							noteFreqsOpen = !noteFreqsOpen
						}
					},
					plusMinus(noteFreqsOpen),
					' Show note frequencies quick reference'
				)
			),
			noteFreqsOpen && m('p.frequency-list',
				Object.keys(NOTES).map(n => {
					const f = NOTES[n]
					return m('.frequency', padNote(n) + ':' + (f != null ? f.toFixed(2) : '?'))
				})
			),
			m('h2', 'Provided Helper Functions'),
			m('p', 'Some code is prepended to your script which makes available several helper functions and constants.'),
			m('p',
				m('a',
					{
						href: '',
						onclick: (e: Event) => {
							e.preventDefault()
							showGLSL = !showGLSL
						}
					},
					plusMinus(showGLSL), ' Show full GLSL source'
				)
			),
			showGLSL && m('.code', fullSource),
			m('h2', 'Select Theme'),
			m('p',
				m('select', {
						value: theme,
						onchange: (e: Event) => {
							onSelectTheme((e.currentTarget as HTMLSelectElement).value)
						}
					},
					themes.map(th => m('option', {value: th}, th))
				)
			),
			m('hr'),
			m('p',
				m('span', '© 2019 by '),
				m('a', {href: 'https://github.com/spacejack', rel: 'noopener', target: '_blank'}, 'spacejack')
			),
			m('h4', 'Built with:'),
			m('ul.credits',
				credits.map(c => m('li',
					m('a',
						{href: c.href, rel: 'noopener', target: '_blank'},
						c.text
					)
				))
			)
		)
	}
}

function plusMinus (isOpen: boolean) {
	return m('span',
		{style: 'font-family: monospace'},
		isOpen ? '-' : '+'
	)
}
