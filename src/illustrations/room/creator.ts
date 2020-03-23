import Illustrations, { IllustrationDestructor } from '../../utils/illustrations';
import { SVG as svg } from '@svgdotjs/svg.js';

import createSvgElement from '../../utils/createsvgelement';
import parallax from '../../utils/parallax';
import blinds from './blinds';
import toodEyes from './toodeyes';
import toggleDrawer from './toggledrawer';
import tv from './tv';

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

	// TV
	// -------------------------------------------------------------------------------------------------------------- //
	tv();

	// Toggling drawer
	// -------------------------------------------------------------------------------------------------------------- //
	toggleDrawer( illustrations );

	// Change illustration after clicking oscar
	// -------------------------------------------------------------------------------------------------------------- //
	document.querySelector( '#oscar-small' ).addEventListener( 'click', () => {
		illustrations.show( 'oscar' );
	} );

	// Dog's smile
	// -------------------------------------------------------------------------------------------------------------- //
	const leash = document.querySelector( '#leash' );
	const originalSmileData = document.querySelector( '#smile' ).getAttribute( 'd' );
	const newSmileData = 'M41.1,100.5 c0,0,22.9-6.5,22.9-19';
	const smilePath = svg( '#smile' );

	leash.addEventListener( 'mouseenter', () => {
		smilePath.animate().attr( { d: newSmileData } );
	} );

	leash.addEventListener( 'mouseleave', () => {
		smilePath.animate().attr( { d: originalSmileData } );
	} );

	// Blinds
	// -------------------------------------------------------------------------------------------------------------- //
	blinds( illustrations.current.data );

	// Tood eyes
	// -------------------------------------------------------------------------------------------------------------- //
	const toodEyesDestructor = toodEyes();

	// Destructor
	// -------------------------------------------------------------------------------------------------------------- //
	return function destroy(): void {
		[ hallSvg, dogSvg, wallSvg, lampSvg, tvSvg ].forEach( el => el.remove() );
		parallaxDestructor();
		toodEyesDestructor();
	};
}
