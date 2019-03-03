import Stream from 'mithril/stream'

/** Returns a dependent stream that omits the initial value of the parent stream */
export function dropInitial<T>(s: Stream<T>) {
	let isset = false
	const e = Stream<T>()
	s.map(x => (isset ? e(x) : isset = true, x))
	return isset ? e : s.map(x => x)
}

/** Returns a stream that only emits when the preticate is satisfied */
export function filterStream<T>(f: (t: T) => boolean, s: Stream<T>) {
	const filtered = Stream<T>()
	s.map(t => {
		if (f(t)) filtered(t)
	})
	return filtered
}
