import Scenes, { SceneDestructor } from '../../utils/scenes';
import { gsap } from 'gsap';

import createSvgElement from '../../utils/createsvgelement';
import escHandler from '../../utils/eschandler';
import hoverHandler from '../../utils/hoverhandler';
import sendEvent from '../../utils/sendevent';
import createBackButton from '../../components/backbutton/createbackbutton';

import drawerSvgData from './images/drawer.svg';

import './style.css';

export default function drawerSceneCreator( scenes: Scenes ): SceneDestructor {
	const element = scenes.element;
	const escHandlerDestructor = escHandler( () => {
		scenes.show( 'room' );
		sendEvent( 'drawer-scene', 'leave', 'Esc' );
	} );

	createSvgElement( drawerSvgData, { id: 'drawer-inside', classes: 'plan' }, element );

	createBackButton( element, () => {
		scenes.show( 'room' );
		sendEvent( 'drawer-scene', 'leave', 'Button' );
	} );

	sendEvent( 'drawer-scene', 'enter' );

	let eventTimeoutId: ReturnType<typeof setTimeout>;

	let floppyAnimation: gsap.core.Timeline | gsap.core.Tween = gsap.timeline( { delay: 3 } )
		.to( '#silver', { x: -30, y: -16 } )
		.to( '#silver', { x: 0, y: 0, duration: .1 } );

	hoverHandler( document.querySelector( '#floppy' ), {
		enter: () => {
			floppyAnimation.kill();
			floppyAnimation = gsap.to( '#silver', { x: -30, y: -16 } );
			eventTimeoutId = setTimeout( () => {
				sendEvent( 'drawer-scene', 'Floppy disc hovered' );
			}, 500 );
		},
		leave: () => {
			floppyAnimation.kill();
			floppyAnimation = gsap.to( '#silver', { x: 0, y: 0, duration: .1 } );
			clearInterval( eventTimeoutId );
		}
	} );

	return function destroy(): void {
		escHandlerDestructor();
		floppyAnimation.kill();
	};
}
