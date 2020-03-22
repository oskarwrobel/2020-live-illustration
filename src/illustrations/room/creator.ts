import Illustrations, { Illustration } from '../../utils/illustrations';
import { SVG as svg } from '@svgdotjs/svg.js';

import createSvgElement from '../../utils/createsvgelement';
import parallax from '../../utils/parallax';
import blinds from './blinds';
import toodEyes from './toodeyes';

import hallSvgString from './images/hall.svg';
import dogSvgString from './images/dog.svg';
import wallSvgString from './images/wall.svg';
import lampSvgString from './images/lamp.svg';
import tvSvgString from './images/tv.svg';

import './room.css';

export default function creator( illustrations: Illustrations ): Illustration {
	const element = illustrations.element;

	const hall = createSvgElement( hallSvgString, { id: 'hall', classes: 'scene' }, element );
	const dog = createSvgElement( dogSvgString, { id: 'dog', classes: 'scene' }, element );
	const wall = createSvgElement( wallSvgString, { id: 'wall', classes: 'scene' }, element );
	const lamp = createSvgElement( lampSvgString, { id: 'lamp', classes: 'scene' }, element );
	const tv = createSvgElement( tvSvgString, { id: 'tv', classes: 'scene' }, element );

	// Initialize parallax.
	const parallaxDestructor = parallax( {
		scene: illustrations.element,
		items: [
			{ element: hall, friction: 0.05 },
			{ element: dog, friction: 0.065 },
			{ element: wall, friction: 0.03 },
			{ element: lamp, friction: 0.2 },
			{ element: tv, friction: 0.05 }
		]
	} );

	document.querySelector( '#oscar-small' ).addEventListener( 'click', () => {
		illustrations.show( 'oscar' );
	} );

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

	blinds();
	const toodEyesDestructor = toodEyes();

	return {
		destroy() {
			[ hall, dog, wall, lamp, tv ].forEach( el => el.remove() );
			parallaxDestructor();
			toodEyesDestructor();
		}
	} as Illustration;
}
