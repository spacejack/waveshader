import m from 'mithril'
import {clamp, parseInt53} from '../../lib/math'

export interface Attrs {
	duration: number
	onChange(duration: number): void
}

export default function DurationInput(): m.Component<Attrs> {
	let value: string

	return {
		oninit: ({attrs: {duration}}) => {
			value = String(duration)
		},
		view: ({attrs: {onChange}}) => m('.duration-input',
			m('span.nosel', 'Duration: '),
			m('input', {
				type: 'text',
				value,
				maxlength: '5',
				oninput: (e: Event) => {
					value = (e.currentTarget as HTMLInputElement).value
						.replace(/[^0-9]+/g, '')
					let n = parseInt53(value)
					if (n != null) {
						n = clamp(n, 0, 99999)
						onChange(n)
						value = String(n)
					}
				}
			}),
			m('span.nosel', ' ms')
		),
	}
}
