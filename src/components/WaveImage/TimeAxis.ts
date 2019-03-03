import m from 'mithril'
import Stream from 'mithril/stream'
import {WaveViewPort} from '../../Wave/draw'
import Observer from '../Observer'

interface Attrs {
	viewPort$: Stream<WaveViewPort>
}

function calcTicDur (width: number, duration: number) {
	const maxTics = Math.floor(width / 100)
	let s = 128 // Start here then scale down until best fit
	for (; s > 0.0001 && duration / s < maxTics; s /= 2) {}
	return s
}

function renderTimeAxis (vp: WaveViewPort): m.Vnode[] {
	const vpDur = vp.width * vp.scale
	const ticDur = calcTicDur(vp.width, vpDur)
	const vnodes: m.Vnode[] = []
	const offset = -(vp.offset % ticDur)
	for (let t = 0; t <= vpDur + ticDur; t += ticDur) {
		vnodes.push(
			m('.text',
				{style: `transform: translateX(${(t + offset) / vp.scale}px)`},
				//'⏐\n' + (t + vp.offset + offset).toFixed(3)
				m('.tic'), '\n' + (t + vp.offset + offset).toFixed(3)
			)
		)
	}
	return vnodes
}

const TimeAxis: m.Component<Attrs> = {
	view: ({attrs: {viewPort$}}) => {
		return m(Observer, {
				data$: viewPort$,
				render: (vp: WaveViewPort) => {
					return renderTimeAxis(vp)
				}
			},
			m('.time-axis')
		)
	}
}

export default TimeAxis
