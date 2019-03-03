/**
 * Throttles the supplied function, but ensures the last
 * call is not discarded
 */
export function throttle (
	fn: (...params: any[]) => any,
	limit = 1000
) {
	let wait = false
	let pendingArgs: any

	function run (args: any) {
		fn.apply(null, args)
		wait = true
		setTimeout(() => {
			if (pendingArgs) {
				run(pendingArgs)
				pendingArgs = undefined
			} else {
				wait = false
			}
		}, limit)
	}

	return function throttled() {
		if (!wait) {
			run(arguments)
		} else {
			pendingArgs = arguments
		}
	}
}

/**
 * Throttles the supplied function, but waits for the
 * specified duration before calling it.
 */
export function throttleWait (
	fn: (...params: any[]) => any,
	delay = 1000
) {
	let wait = false
	let pendingArgs: any
	let timer: number | undefined

	function run (args: any) {
		if (timer) {
			clearTimeout(timer)
		}
		timer = setTimeout(() => {
			fn.apply(null, args)
			wait = true
			if (pendingArgs) {
				run(pendingArgs)
				pendingArgs = undefined
			} else {
				wait = false
			}
		}, delay)
	}

	return function throttled() {
		if (!wait) {
			run(arguments)
		} else {
			pendingArgs = arguments
		}
	}
}
