import m from 'mithril'
import {triggerTransition, transitionPromise} from '../../lib/dom'

export interface Attrs {
	text: string
}

export default function SharePanel(): m.Component<Attrs> {
	return {
		oncreate: ({dom}) => triggerTransition(dom, 'open'),
		onbeforeremove: ({dom}) => transitionPromise(dom, 'open'),
		view: ({attrs: {text}}) => m('.share-panel',
			m('textarea', {readonly: true}, text)
		)
	}
}
