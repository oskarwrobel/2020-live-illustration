import Scenes, { SceneDestructor } from '../../utils/scenes';

import createSvgElement from '../../utils/createsvgelement';
import escHandler from '../../utils/eschandler';
import sendEvent from '../../utils/sendevent';
import createBackButton from '../../components/backbutton/createbackbutton';

import drawerSvgData from './images/drawer.svg';

import './style.css';

export default function creator( scenes: Scenes ): SceneDestructor {
	const element = scenes.element;
	const escDestructor = escHandler( () => {
		scenes.show( 'room' );
		sendEvent( 'drawer', 'leave', 'Esc' );
	} );

	sendEvent( 'drawer', 'enter' );

	createSvgElement( drawerSvgData, { id: 'drawer-inside', classes: 'plan' }, element );
	createBackButton( element, () => {
		scenes.show( 'room' );
		sendEvent( 'drawer', 'leave', 'button' );
	} );

	return function destroy(): void {
		escDestructor();
	};
}
