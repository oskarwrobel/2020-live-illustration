import { throttle } from 'lodash';

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

	function mouseMoveHandler( evt: MouseEvent ): void {
		requestAnimationFrame( () => {
			const sceneRect = config.scene.getBoundingClientRect();
			const center = sceneRect.width / 2;
			const move = ( ( ( evt.clientX - sceneRect.left ) * 100 ) / center ) - 100;

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

				element.style.transform = `translateX( ${ -move * friction }% )`;
			}
		} );
	}

	document.addEventListener( 'mousemove', throttle( mouseMoveHandler, 50, { leading: true } ) );
}

export default function parallax( config: Config ): void {
	createParallax( config );
}
