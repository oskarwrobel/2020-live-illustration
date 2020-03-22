export interface Animate {
	stop(): void;
}

export type Easing = ( progress: number ) => number;

export type Config = {
	from: number;
	to: number;
	easing: Easing;
	duration: number;
	onUpdate: ( value: number ) => void;
};

export default function animate( config: Config ): Animate {
	const { from = 0, to, easing, duration, onUpdate } = config;

	let stop = false;
	let start: number;

	function step( timestamp: number ): void {
		if ( stop ) {
			return;
		}

		if ( !start ) {
			start = timestamp;
		}

		const end = start + duration;

		if ( timestamp > end ) {
			onUpdate( to );

			return;
		}

		const progress = ( timestamp - start ) / ( end - start );
		const factor = easing( progress );
		const value = ( ( to - from ) * factor ) + from;

		onUpdate( value );
		requestAnimationFrame( step );
	}

	requestAnimationFrame( step );

	return {
		stop() {
			stop = true;
		}
	} as Animate;
}

export function easeOutQuad( t: number ): number {
	return t * ( 2 - t );
}
