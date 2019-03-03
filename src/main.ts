// App entry point
import m from 'mithril'
import WaveUrl from './Wave/WaveUrl'
import App from './components/App'

// Did user arrive with a wave encoded in the URL
const waveUrl = WaveUrl.fromLocationHash(window.location.hash)

// Mount the root Mithril component
m.mount(document.body, {
	view: () => m(App, {waveUrl})
})

///////////////////////////////////////////////////////////
// For browserify-hmr
// See browserify-hmr module.hot API docs for hooks docs.
declare const module: any // tslint:disable-line no-reserved-keywords
if (typeof module !== 'undefined' && module.hot) {
	module.hot.accept()
	// module.hot.dispose((data: any) => {
	// 	m.redraw();
	// })
}
///////////////////////////////////////////////////////////
