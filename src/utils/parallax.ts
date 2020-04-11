import { gsap } from 'gsap';
import { throttle, clamp } from 'lodash-es';

type Item = {
	element: Element;
	depth: number;
	revert?: boolean;
}

type Config = {
	scene: HTMLElement;
	items: Item[];
};

// Value from 0 - 100 defines how big shift the deepest plan should make.
const sensitivity = 6;

export default function parallax( config: Config ): () => void {
	let sceneRect = config.scene.getBoundingClientRect();
	let moveRange = sceneRect.width * sensitivity / 100;
	let lastValue: number;

	config.scene.classList.add( 'parallax' );

	const throttledMouseMoveHandler = throttle( mouseMoveHandler, 50, { leading: true } );
	const throttledResizeHandler = throttle( resizeHandler, 100 );

	document.addEventListener( 'mousemove', throttledMouseMoveHandler );
	document.addEventListener( 'resize', throttledResizeHandler );

	function mouseMoveHandler( evt: MouseEvent ): void {
		requestAnimationFrame( () => {
			const center = sceneRect.width / 2;
			const distanceFromCenter = ( ( ( evt.clientX - sceneRect.left ) * 100 ) / center ) - 100;
			const direction = distanceFromCenter < 0 ? -1 : 1;
			const value = clamp( Math.abs( distanceFromCenter ), 0, 100 ) * moveRange / 100;

			move( value * direction );
		} );
	}

	function resizeHandler(): void {
		window.addEventListener( 'resize', () => {
			sceneRect = config.scene.getBoundingClientRect();
			moveRange = sceneRect.width * moveRange / 100;
		} );
	}

	// window.addEventListener( 'deviceorientation', throttle( ( evt: DeviceOrientationEvent ) => {
	// 	move( evt.alpha * 100 / 180 );
	// }, 0, { leading: true } ) );

	// if ( DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function' ) {
	// 	DeviceOrientationEvent.requestPermission()
	// 		.then( ( response: string ) => {
	// 			if ( response === 'rejected' ) {
	// 				document.addEventListener( 'click', askForPermission );
	// 			}
	// 		} )
	// 		.catch( () => document.addEventListener( 'click', askForPermission ) );
	// }

	function move( value: number ): void {
		if ( lastValue === value ) {
			return;
		}

		lastValue = value;

		for ( const item of config.items ) {
			const element = item.element as HTMLElement;

			let x = -value * item.depth;

			if ( item.revert ) {
				x = -x;
			}

			gsap.to( element, { x } );
		}
	}

	// function askForPermission(): void {
	// 	DeviceOrientationEvent.requestPermission().then( response => {
	// 		if ( response === 'granted' ) {
	// 			window.removeEventListener( 'click', askForPermission );
	// 		}
	// 	} );
	// }

	return function destroy(): void {
		document.removeEventListener( 'mousemove', throttledMouseMoveHandler );
		window.removeEventListener( 'resize', throttledResizeHandler );
		config.scene.classList.remove( 'parallax' );
	};
}
