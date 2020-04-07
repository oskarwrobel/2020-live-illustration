import { gsap } from 'gsap';
import Scenes, { SceneDestructor } from '../../utils/scenes';
import createSvgElement from '../../utils/createsvgelement';

import postcardSvgString from './images/postcard.svg';
import escHandler from '../../utils/eschandler';
import sendEvent from '../../utils/sendevent';
import createBackButton from '../../components/backbutton/createbackbutton';

export default function postcardSceneCreator( scenes: Scenes ): SceneDestructor {
	const element = scenes.element;

	createSvgElement( postcardSvgString, { id: 'hall', classes: 'plan' }, element );

	const escDestructor = escHandler( () => {
		scenes.show( 'room' );
		sendEvent( 'drawer-scene', 'leave', 'Esc' );
	} );

	createBackButton( element, () => {
		scenes.show( 'room' );
		sendEvent( 'drawer-scene', 'leave', 'Button' );
	} );

	gsap.set( '#cover', { scaleY: 1.1 } );
	gsap.set( [ '#left-hand', '#right-hand' ], { y: -10, rotate: -10, scale: .8 } );

	const tl = gsap.timeline( { yoyo: true, delay: 2, repeatDelay: 2, repeat: -1 } )
		.to( '#cover', { scaleY: 1, delay: 2, duration: .3, ease: 'none', transformOrigin: 'right top' } )
		.to(
			[ '#left-hand', '#right-hand' ],
			{ y: 0, rotate: 0, scale: 1, delay: -.3, duration: .3, ease: 'none', transformOrigin: 'left top' }
		)
		.to( {}, { duration: .5 } );

	return function postcardSceneDestructor(): void {
		escDestructor();
		tl.kill();
	};
}