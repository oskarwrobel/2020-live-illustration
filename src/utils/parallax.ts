import { throttle, clamp } from 'lodash-es';

type Item = {
	element: Element;
	friction: number;
	revert?: boolean;
}

type Config = {
	scene: HTMLElement;
	items: Item[];
};

export default function parallax( config: Config ): () => void {
	let lastValue: number;

	config.scene.classList.add( 'parallax' );

	const throttledMouseMoveHandler = throttle( mouseMoveHandler, 50, { leading: true } );

	document.addEventListener( 'mousemove', throttledMouseMoveHandler );

	function mouseMoveHandler( evt: MouseEvent ): void {
		const sceneRect = config.scene.getBoundingClientRect();
		const center = sceneRect.width / 2;
		const value = ( ( ( evt.clientX - sceneRect.left ) * 100 ) / center ) - 100;

		move( clamp( value, -100, 100 ) );
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
		requestAnimationFrame( () => {
			for ( const item of config.items ) {
				const element = item.element as HTMLElement;
				const friction = item.friction;

				let x = -value * friction;

				if ( item.revert ) {
					x = -x;
				}

				element.style.transform = `translateX( ${ x }% )`;
			}
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
		config.scene.classList.remove( 'parallax' );
	};
}
