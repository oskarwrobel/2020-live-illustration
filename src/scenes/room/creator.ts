import { gsap } from 'gsap';
import Scenes, { SceneDestructor } from '../../utils/scenes';

import createSvgElement from '../../utils/createsvgelement';
import parallax from '../../utils/parallax';
import sendEvent from '../../utils/sendevent';

import windowWithBlinds from './helpers/windowwithblinds';
import toddEyes from './helpers/toddeyes';
import drawer from './helpers/drawer';
import tv from './helpers/tv';
import oscarStatue from './helpers/oscarstatue';
import postcard from './helpers/postcard';

import hallSvgString from './images/hall.svg';
import dogSvgString from './images/dog.svg';
import wallSvgString from './images/wall.svg';
import wallBackgroundSvgString from './images/wallbackground.svg';
import lampSvgString from './images/lamp.svg';
import tvSvgString from './images/tv.svg';

import './style.css';

export default function roomSceneCreator( scenes: Scenes ): SceneDestructor {
	const element = scenes.element;

	const hallSvg = createSvgElement( hallSvgString, { id: 'hall', classes: 'plan' }, element );
	const dogSvg = createSvgElement( dogSvgString, { id: 'dog', classes: 'plan' }, element );
	createSvgElement( wallBackgroundSvgString, { id: 'wall-background', classes: 'plan' }, element );
	const wallSvg = createSvgElement( wallSvgString, { id: 'wall', classes: 'plan' }, element );
	const lampSvg = createSvgElement( lampSvgString, { id: 'lamp', classes: 'plan' }, element );
	const tvSvg = createSvgElement( tvSvgString, { id: 'tv', classes: 'plan' }, element );

	// Initialize parallax
	// -------------------------------------------------------------------------------------------------------------- //
	const parallaxDestructor = parallax( {
		scene: scenes.element,
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
			sendEvent( 'room-scene', 'Dog smile' );
		}, 500 );
	} );

	leash.addEventListener( 'mouseleave', () => {
		leashTween.reverse();
		clearInterval( eventTimeoutId );
	} );

	// Postcard
	// -------------------------------------------------------------------------------------------------------------- //
	postcard( scenes );

	// Drawer
	// -------------------------------------------------------------------------------------------------------------- //
	drawer( scenes );

	// TV
	// -------------------------------------------------------------------------------------------------------------- //
	const tvDestructor = tv( scenes.current.data );

	// Oscar statue
	// -------------------------------------------------------------------------------------------------------------- //
	const oscarStatueDestructor = oscarStatue( scenes );

	// Window
	// -------------------------------------------------------------------------------------------------------------- //
	const windowWithBlindsDestructor = windowWithBlinds( scenes );

	// Todd eyes
	// -------------------------------------------------------------------------------------------------------------- //
	const toddEyesDestructor = toddEyes();

	// Destructor
	// -------------------------------------------------------------------------------------------------------------- //
	return function destroy(): void {
		parallaxDestructor();
		tvDestructor();
		oscarStatueDestructor();
		windowWithBlindsDestructor();
		toddEyesDestructor();
	};
}
