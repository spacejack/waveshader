import {range} from '../../lib/array'

export const LOW_C_HZ = 16.35

export const NOTES_IDS = ['C', 'Cs', 'Db', 'D', 'Ds', 'Eb', 'E', 'F', 'Fs', 'Gb', 'G', 'Gs', 'Ab', 'A', 'As', 'Bb', 'B']

export const UNIQUE_NOTES = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B']

const DUP_NOTES: Record<string, string> = {
	'Cs': 'Db', 'Ds': 'Eb', 'Fs': 'Gb', 'Gs': 'Ab', 'As': 'Bb'
}

/** Dictionary of note identifiers and their frequencies for 9 octaves */
export const NOTES = range(9).reduce(
	(d, i) => {
		const istr = String(i)
		for (let n = 0; n < UNIQUE_NOTES.length; ++n) {
			const note = UNIQUE_NOTES[n]
			const k = note + istr
			const v = Math.pow(2, i) * LOW_C_HZ * Math.pow(2, n / UNIQUE_NOTES.length)
			d[k] = v
			const nk = DUP_NOTES[note]
			if (nk != null) {
				d[nk + istr] = v
			}
		}
		return d
	},
	Object.create(null) as Record<string, number>
)

/* Helper to parse string/number type */
export function noteToHz (note: number | string): number {
	if (typeof note === 'number') {
		return note
	}
	const hz = NOTES[note as string]
	if (!hz) {
		throw !!note
			? new Error('Unrecognized note')
			: new Error('Note parameter required')
	}
	return hz
}
