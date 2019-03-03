export type HyperScript = (
	s: string, attrs?: {[id: string]: any}, ...params: any[]
) => any

export interface HyperScriptAttrs {
	[id: string]: any
}

export interface HyperSVGAttrs extends HyperScriptAttrs {
	width?: number | string
	height?: number | string
	viewBox?: string
}

/** Inject Hyperscript dependency once then use the returned interface */
export default function HyperSVG (h: HyperScript, config: HyperSVGAttrs = {}) {
	config = {
		width: config.width || '1em',
		height: config.height || '1em',
		viewBox: config.viewBox || '0 0 1 1',
		...config
	}
	return {
		svg: (attrs?: HyperSVGAttrs, ...children: any[]) => {
			return svg(h, {...config, ...attrs}, ...children)
		},
		rect: (attrs?: RectAttrs) => {
			return rect(h, {
				x: 0, y: 0, width: config.width!, height: config.height!,
				...attrs
			})
		},
		svgRect: (attrs: HyperSVGAttrs, rcAttrs: RectAttrs) => {
			return svg(h, {...config, ...attrs},
				rect(h, rcAttrs)
			)
		},
		triangle: (attrs?: TriangleAttrs) => {
			return triangle(h, attrs)
		},
		svgTriangle: (attrs?: HyperSVGAttrs, triAttrs?: TriangleAttrs) => {
			return svg(h, {...config, ...attrs},
				triangle(h, triAttrs)
			)
		},
		speakerIcon: () => speakerIcon(h),
		svgSpeakerIcon: (attrs?: HyperSVGAttrs) => svg(h,
			{...config, viewBox: '0 0 75 75', ...attrs},
			speakerIcon(h)
		),
		downloadIcon: () => downloadIcon(h),
		svgDownloadIcon: (attrs?: HyperSVGAttrs) => svg(h,
			{...config, viewBox: '0 0 433.5 433.5', ...attrs},
			downloadIcon(h)
		),
		shareIcon: () => shareIcon(h),
		svgShareIcon: (attrs?: HyperSVGAttrs) => svg(h,
			{...config, viewBox: '0 0 96 96', ...attrs},
			shareIcon(h)
		)
		// svg: svg.bind(undefined, h) as (attrs?: {[id: string]: any}, children?: any) => any,
		// triangle: triangle.bind(undefined, h) as (attrs?: {[id: string]: any}) => any,
		// playIcon: playIcon.bind(undefined, h) as (attrs?: {[id: string]: any}) => any
	}
}

export function svg (h: HyperScript, attrs: HyperSVGAttrs = {}, children?: any) {
	const a = {...attrs,
		viewBox: attrs.viewBox || '0 0 1 1',
		width: attrs.width || '1em',
		height: attrs.height || '1em'
	}
	return h('svg', a, children)
}

export interface RectAttrs extends HyperScriptAttrs {
	x: number | string
	y: number | string
	width: number | string
	height: number | string
	rx?: number | string
	ry?: number | string
}

export function rect (h: HyperScript, attrs: RectAttrs) {
	return h('rect', attrs)
}

export interface TriangleAttrs extends HyperScriptAttrs {
	width?: number
	height?: number
	// TODO: Implement this
	angle?: number
}

export function triangle (h: HyperScript, attrs: TriangleAttrs = {}) {
	const {width = 1, height = 1, angle = 0, ...polyAttrs} = attrs
	const xl = width * (Math.sqrt(2) / 6)
	return h('polygon', {
		points: `${width},${height / 2}, ${xl},0 ${xl},${height}`,
		...polyAttrs
	})
}

export function speakerIcon (h: HyperScript) {
	return h('g',
		h('polygon', {
			points: "39.389,13.769 22.235,28.606 6,28.606 6,47.699 21.989,47.699 39.389,62.75 39.389,13.769"
		}),
		h('path', {
			d: "M 48.128,49.03 C 50.057,45.934 51.19,42.291 51.19,38.377 C 51.19,34.399 50.026,30.703 48.043,27.577"
		}),
		h('path', {
			d: "M 55.082,20.537 C 58.777,25.523 60.966,31.694 60.966,38.377 C 60.966,44.998 58.815,51.115 55.178,56.076"
		}),
		h('path', {
			d: "M 61.71,62.611 C 66.977,55.945 70.128,47.531 70.128,38.378 C 70.128,29.161 66.936,20.696 61.609,14.01"
		})
	)
}

export function downloadIcon (h: HyperScript) {
	return h('g',
		h('path', {
			d: 'M395.25,153h-102V0h-153v153h-102l178.5,178.5L395.25,153z M38.25,382.5v51h357v-51H38.25z'
		})
	)
}

export function shareIcon (h: HyperScript) {
	return h('g', {
		d: 'M67.5,18c-5.1,0-9.3,4.2-9.3,9.3c0,0.5,0.1,1.1,0.2,1.6l-23,12.9c-1.7-1.8-4.1-3-6.8-3c-5.1,0-9.3,4.1-9.3,9.3c0,5.1,4.1,9.3,9.3,9.3c2.7,0,5.2-1.2,6.9-3.1l22.8,13.4c0,0.4-0.1,0.7-0.1,1.1c0,5.1,4.1,9.3,9.3,9.3c5.1,0,9.3-4.1,9.3-9.3c0-5.1-4.1-9.3-9.3-9.3c-2.8,0-5.4,1.3-7.1,3.3L37.7,49.4c0.1-0.4,0.1-0.9,0.1-1.3c0-0.5,0-1-0.1-1.5l23.1-13c1.7,1.8,4.1,3,6.8,3c5.1,0,9.3-4.1,9.3-9.3C76.8,22.2,72.6,18,67.5,18L67.5,18z'
	})
}
