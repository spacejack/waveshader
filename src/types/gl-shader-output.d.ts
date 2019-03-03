declare module 'gl-shader-output' {
	import Shader from 'gl-shader'

	interface RenderOptions {
		width?: number;
		height?: number;
		preserveDrawingBuffer?: boolean;
		float?: boolean;
	}

	type Render = (
		uniforms: {[id: string]: number | ArrayLike<number>}
	) => ArrayLike<number>;

	type Factory = (
		shader: string | ReturnType<typeof Shader>,
		options?: RenderOptions
	) => Render;

	const f: Factory;
	export = f;
}
