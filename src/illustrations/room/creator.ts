import Illustrations, { IllustrationDestructor } from '../../utils/illustrations';
import { gsap } from 'gsap';

import createSvgElement from '../../utils/createsvgelement';
import parallax from '../../utils/parallax';
import windowWithBlinds from './windowwithblinds';
import toodEyes from './toodeyes';
import drawer from './drawer';
import tv from './tv';
import oscarStatue from './oscarstatue';

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
			{ element: hallSvg, friction: 0.05 },
			{ element: dogSvg, friction: 0.065 },
			{ element: wallSvg, friction: 0.03 },
			{ element: lampSvg, friction: 0.2 },
			{ element: tvSvg, friction: 0.05 }
		]
	} );

	// Dog's smile
	// -------------------------------------------------------------------------------------------------------------- //
	const leash = document.querySelector( '#leash' );
	const leashTween = gsap.to( '#smile', { attr: { d: 'M41.1,100.5 c0,0,22.9-6.5,22.9-19' }, paused: true } );

	leash.addEventListener( 'mouseenter', () => ( leashTween.play() ) );
	leash.addEventListener( 'mouseleave', () => ( leashTween.reverse() ) );

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
