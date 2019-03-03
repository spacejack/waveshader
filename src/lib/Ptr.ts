const DEVICE_NONE  = 0
const DEVICE_MOUSE = 1
const DEVICE_TOUCH = 2

export class PtrEvent {
	type: 'down' | 'up' | 'move'
	x: number
	y: number
	domEvent: Event
	constructor (type: 'down' | 'up' | 'move', x: number, y: number, e: Event) {
		this.type = type
		this.x = x
		this.y = y
		this.domEvent = e
	}
}

export interface PtrCallbacks {
	onDown?(e: PtrEvent): void
	onUp?(e: PtrEvent): void
	onMove?(e: PtrEvent): void
}

/**
 * Creates a new Ptr instance attached to the element
 */
function Ptr (el: HTMLElement, callbacks: PtrCallbacks) {
	let device = DEVICE_NONE

	function onMouseDown (e: MouseEvent) {
		e.preventDefault()
		if (device === DEVICE_TOUCH) {
			return
		}
		device = DEVICE_MOUSE
		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp)
		if (callbacks.onDown) {
			callbacks.onDown(new PtrEvent('down', e.pageX, e.pageY, e))
		}
	}

	function onTouchStart (e: TouchEvent) {
		e.preventDefault()
		if (device === DEVICE_MOUSE) {
			return
		}
		device = DEVICE_TOUCH
		el.addEventListener('touchmove', onTouchMove)
		el.addEventListener('touchend', onTouchEnd)
		if (callbacks.onDown) {
			const t = e.changedTouches[0]
			callbacks.onDown(new PtrEvent('down', t.pageX, t.pageY, e))
		}
	}

	function onMouseMove (e: MouseEvent) {
		e.preventDefault()
		if (callbacks.onMove) {
			callbacks.onMove(new PtrEvent('move', e.pageX, e.pageY, e))
		}
	}

	function onTouchMove (e: TouchEvent) {
		e.preventDefault()
		if (callbacks.onMove) {
			const t = e.changedTouches[0]
			callbacks.onMove(new PtrEvent('move', t.pageX, t.pageY, e))
		}
	}

	function onPointerUp (x: number, y: number, e: Event) {
		e.preventDefault()
		const d = device
		setTimeout(() => {
			if (device === d) {
				device = DEVICE_NONE
			}
		}, 200)
		if (callbacks.onUp) {
			callbacks.onUp(new PtrEvent('up', x, y, e))
		}
	}

	function onMouseUp (e: MouseEvent) {
		window.removeEventListener('mouseup', onMouseUp)
		window.removeEventListener('mousemove', onMouseMove)
		onPointerUp(e.pageX, e.pageY, e)
	}

	function onTouchEnd (e: TouchEvent) {
		window.removeEventListener('touchend', onTouchEnd)
		window.removeEventListener('touchmove', onTouchMove)
		const t = e.changedTouches[0]
		onPointerUp(t.pageX, t.pageY, e)
	}

	function destroy() {
		window.removeEventListener('mousemove', onMouseMove)
		window.removeEventListener('mouseup', onMouseUp)
		window.removeEventListener('touchmove', onTouchMove)
		window.removeEventListener('touchend', onTouchEnd)
		el.removeEventListener('mousedown', onMouseDown)
		el.removeEventListener('touchstart', onTouchStart)
	}

	el.addEventListener('mousedown', onMouseDown)
	el.addEventListener('touchstart', onTouchStart)

	return {destroy}
}

/** Mouse/Touch input abstraction for down/up/move events */
interface Ptr extends ReturnType<typeof Ptr> {}

export default Ptr
