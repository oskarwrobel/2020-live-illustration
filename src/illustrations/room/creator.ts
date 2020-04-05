import Illustrations, { IllustrationDestructor } from '../../utils/illustrations';
import { gsap } from 'gsap';

import createSvgElement from '../../utils/createsvgelement';
import parallax from '../../utils/parallax';
import sendEvent from '../../utils/sendevent';

import windowWithBlinds from './utils/windowwithblinds';
import toodEyes from './utils/toodeyes';
import drawer from './utils/drawer';
import tv from './utils/tv';
import oscarStatue from './utils/oscarstatue';

import hallSvgString from './images/hall.svg';
import dogSvgString from './images/dog.svg';
import wallSvgString from './images/wall.svg';
import lampSvgString from './images/lamp.svg';
import tvSvgString from './images/tv.svg';

import './style.css';

export default function creator( illustrations: Illustrations ): IllustrationDestructor {
	const element = illustrations.element;

	const hallSvg = createSvgElement( hallSvgString, { id: 'hall', classes: 'scene' }, element );
	const dogSvg = createSvgElement( dogSvgString, { id: 'dog', classes: 'scene' }, element );
	const wallSvg = createSvgElement( wallSvgString, { id: 'wall', classes: 'scene' }, element );
	const lampSvg = createSvgElement( lampSvgString, { id: 'lamp', classes: 'scene' }, element );
	const tvSvg = createSvgElement( tvSvgString, { id: 'tv', classes: 'scene' }, element );

	// Initialize parallax
	// -------------------------------------------------------------------------------------------------------------- //
	const parallaxDestructor = parallax( {
		scene: illustrations.element,
		items: [
			{ element: hallSvg, depth: 0.1 },
			{ element: dogSvg, depth: 0.17 },
			{ element: wallSvg, depth: 0.3 },
			{ element: lampSvg, depth: 0.37 },
			{ element: tvSvg, depth: 0.5 }
		]
	} );

	// Dog's smile
	// -------------------------------------------------------------------------------------------------------------- //
	const leash = document.querySelector( '#leash' );
	const leashTween = gsap.to( '#smile', { attr: { d: 'M41.1,100.5 c0,0,22.9-6.5,22.9-19' }, paused: true } );
	let eventTimeoutId: any;

	leash.addEventListener( 'mouseenter', () => {
		leashTween.play();
		eventTimeoutId = setTimeout( () => {
			sendEvent( 'room', 'dogSmile' );
		}, 500 );
	} );

	leash.addEventListener( 'mouseleave', () => {
		leashTween.reverse();
		clearInterval( eventTimeoutId );
	} );

	// Drawer
	// -------------------------------------------------------------------------------------------------------------- //
	drawer( illustrations );

	// TV
	// -------------------------------------------------------------------------------------------------------------- //
	const tvDestructor = tv( illustrations.current.data );

	// Oscar statue
	// -------------------------------------------------------------------------------------------------------------- //
	const oscarStatueDestructor = oscarStatue( illustrations );

	// Window
	// -------------------------------------------------------------------------------------------------------------- //
	const windowWithBlindsDestructor = windowWithBlinds( illustrations );

	// Tood eyes
	// -------------------------------------------------------------------------------------------------------------- //
	const toodEyesDestructor = toodEyes();

	// Destructor
	// -------------------------------------------------------------------------------------------------------------- //
	return function destroy(): void {
		parallaxDestructor();
		tvDestructor();
		oscarStatueDestructor();
		windowWithBlindsDestructor();
		toodEyesDestructor();
	};
}
