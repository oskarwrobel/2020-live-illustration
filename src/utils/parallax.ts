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

export default function parallax( config: Config ): () => void {
	let lastValue: number;
	let sceneRect = config.scene.getBoundingClientRect();

	config.scene.classList.add( 'parallax' );

	const throttledMouseMoveHandler = throttle( mouseMoveHandler, 50, { leading: true } );
	const throttledResizeHandler = throttle( resizeHandler, 100 );

	document.addEventListener( 'mousemove', throttledMouseMoveHandler );
	document.addEventListener( 'resize', throttledResizeHandler );

	function mouseMoveHandler( evt: MouseEvent ): void {
		requestAnimationFrame( () => {
			const center = sceneRect.width / 2;
			const value = ( ( ( evt.clientX - sceneRect.left ) * 100 ) / center ) - 100;

			move( clamp( value, -100, 100 ) );
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

	function resizeHandler(): void {
		window.addEventListener( 'resize', () => {
			sceneRect = config.scene.getBoundingClientRect();
		} );
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
