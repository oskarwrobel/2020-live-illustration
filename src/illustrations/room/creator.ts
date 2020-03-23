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

	// Toggling drawer.
	const front = svg( '#front' );
	const shadow = svg( '#shadow' );
	const orgHeight = shadow.height();
	const shift = 95;
	const shiftShadow = 30;

	if ( illustrations.current.data.drawerIsOpened ) {
		front.translate( shift, 0 );
		shadow.height( orgHeight + shiftShadow );

		setTimeout( () => {
			front.animate( 800 ).translate( -shift, 0 );
			shadow.animate( 800 ).height( orgHeight );
		}, 100 );

		illustrations.current.data.drawerIsOpened = false;
	}

	document.querySelector( '#drawer' ).addEventListener( 'click', () => {
		const x = front.transform().translateX;

		if ( x === shift ) {
			front.animate( 800 ).translate( -shift, 0 );
			shadow.animate( 800 ).height( orgHeight );
		} else if ( x === 0 ) {
			front.animate( 800 ).translate( shift, 0 );
			shadow.animate( 800 ).height( orgHeight + shiftShadow ).after( () => {
				illustrations.current.data.drawerIsOpened = true;
				setTimeout( () => {
					illustrations.show( 'drawer' );
				}, 100 );
			} );
		}
	} );

	// Change illustration after clicking oscar.
	document.querySelector( '#oscar-small' ).addEventListener( 'click', () => {
		illustrations.show( 'oscar' );
	} );

	// Dog's smile.
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

	blinds( illustrations.current.data );
	const toodEyesDestructor = toodEyes();

	return function destroy(): void {
		[ hall, dog, wall, lamp, tv ].forEach( el => el.remove() );
		parallaxDestructor();
		toodEyesDestructor();
	};
}
