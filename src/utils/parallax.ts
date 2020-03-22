import { throttle, clamp } from 'lodash-es';

type Item = {
	element: Element;
	friction: number;
}

type Config = {
	scene: HTMLElement;
	items: Item[];
};

function createParallax( config: Config ): void {
	let isAnimationInProgress = false;
	let lastValue: number;

	document.addEventListener( 'mousemove', throttle( ( evt: MouseEvent ) => {
		const sceneRect = config.scene.getBoundingClientRect();
		const center = sceneRect.width / 2;
		const value = ( ( ( evt.clientX - sceneRect.left ) * 100 ) / center ) - 100;

		move( clamp( value, -100, 100 ) );
	}, 50, { leading: true } ) );

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
			if ( !isAnimationInProgress ) {
				isAnimationInProgress = true;
				config.scene.classList.add( 'animation-in-progress' );

				config.scene.addEventListener( 'transitionend', () => {
					if ( isAnimationInProgress ) {
						config.scene.classList.remove( 'animation-in-progress' );
						isAnimationInProgress = false;
					}
				}, true );
			}

			for ( const item of config.items ) {
				const element = item.element as HTMLElement;
				const friction = item.friction;

				element.style.transform = `translateX( ${ -value * friction }% )`;
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
}

export default function parallax( config: Config ): void {
	createParallax( config );
}
