import m from 'mithril'
import Stream from 'mithril/stream'

/**
 * Note that these attrs are only read once on component init.
 * They are not updatable after that.
 */
export interface Attrs<T> {
	/**
	 * Stream that triggers granular redraw. The stream
	 * reference must remain constant for the life of
	 * the component instance.
	 */
	data$: Stream<T>
	/**
	 * Optional DOM query selector string to find the element to
	 * render into. Otherwise the view's root element will be used.
	 */
	selector?: string
	render(value: T): m.Children
}

export interface State {
	dom: Element
	data$: Stream<any>
	render(value: any): m.Children
}

/**
 * This is a wrapper component that is optimized to only
 * re-render its child vdom on stream updates.
 */
const Observer: m.Component<Attrs<any>, State> = {
	oncreate: ({dom, attrs, state}) => {
		// Create a dependent stream so that we can unsubscribe
		// when this component is removed.
		state.render = attrs.render
		state.dom = typeof attrs.selector === 'string'
			? dom.querySelector(attrs.selector)!
			: dom
		// Re-render only stream updates
		state.data$ = attrs.data$.map(data => {
			m.render(state.dom, state.render(data))
		})
	},

	onbeforeupdate: ({attrs, state}) => {
		state.render = attrs.render
	},

	onremove: ({state}) => {
		// Unsubscribe from source by ending this instance's dependent stream
		state.data$.end(true)
	},

	view: v => v.children
}

export default Observer
