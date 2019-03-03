import m from 'mithril'
import {MAX_DURATION} from '../../config'
import {clamp, parseInt53} from '../../lib/math'
import Timespan from '../../Wave/Timespan'

const MAXLEN = String(MAX_DURATION).length

function parseValue (s: string) {
	const n = parseInt53(s)
	return n != null ? clamp(n, 0, MAX_DURATION) : n
}

export interface Attrs {
	duration: number
	start: number
	onChange(span: Timespan): void
}

/**
 * Filtered inputs for integer start & duration values.
 */
export default function TimespanInput(): m.Component<Attrs> {
	const span = {start: 0, duration: 0}
	let durationStr: string
	let startStr: string

	function update ({attrs}: m.Vnode<Attrs>) {
		span.start = attrs.start
		span.duration = attrs.duration
		durationStr = String(attrs.duration)
		startStr = String(attrs.start)
	}

	return {
		oninit: update,
		onbeforeupdate: update,
		view: ({attrs: {onChange}}) => m('.timespan-input',
			m('span.nosel', 'Start: '),
			m('input', {
				type: 'text',
				value: startStr,
				maxlength: MAXLEN,
				oninput: (e: Event) => {
					startStr = (e.currentTarget as HTMLInputElement).value
						.replace(/[^0-9]+/g, '')
					const s = parseValue(startStr)
					if (s != null) {
						span.start = s
						startStr = String(s)
						onChange(span)
					}
				}
			}),
			m('span.nosel', ' ms'),

			m('span.nosel', {style: 'padding: 0 0.5em'}, '•'),

			m('span.nosel', 'Duration: '),
			m('input', {
				type: 'text',
				value: durationStr,
				maxlength: MAXLEN,
				oninput: (e: Event) => {
					durationStr = (e.currentTarget as HTMLInputElement).value
						.replace(/[^0-9]+/g, '')
					const d = parseValue(durationStr)
					if (d != null) {
						span.duration = d
						durationStr = String(d)
						onChange(span)
					}
				}
			}),
			m('span.nosel', ' ms')
		)
	}
}
