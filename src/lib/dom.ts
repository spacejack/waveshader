/**
 * Forces DOM layout for this element so that toggled
 * classes/styles will trigger transitions.
 */
export function readyDom (element: Element) {
	const rc = element.getBoundingClientRect() // tslint:disable-line no-unused-variable
}

/**
 * Assuming the supplied class name or style properties trigger a
 * transition, this prepares the element then toggles the class or
 * applies the style(s) to initiate the transition.
 */
export function triggerTransition (
	element: Element, toggle: string | Record<string, string | null>
) {
	readyDom(element)
	if (typeof toggle === 'string') {
		element.classList.toggle(toggle)
	} else if ((element as HTMLElement).style) {
		Object.assign((element as HTMLElement).style, toggle)
	}
}

/**
 * @param element The element that is transitioning.
 * @param toggle If supplied, this function will toggle this class or
 * apply the style properties to trigger the transition. Otherwise
 * it is assumed the application has already done so.
 * @returns A promise that resolves when the transition ends.
 */
export function transitionPromise (
	element: Element, toggle?: string | Record<string, string | null>
) {
	if (typeof toggle === 'string') {
		element.classList.toggle(toggle)
	} else if (toggle != null) {
		Object.assign((element as HTMLElement).style, toggle)
	}
	return new Promise<Event>(r => {
		element.addEventListener('transitionend', r)
	})
}
