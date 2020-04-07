import Scenes, { SceneDestructor } from '../../utils/scenes';

import createSvgElement from '../../utils/createsvgelement';
import escHandler from '../../utils/eschandler';
import sendEvent from '../../utils/sendevent';
import createBackButton from '../../components/backbutton/createbackbutton';

import drawerSvgData from './images/drawer.svg';

import './style.css';

export default function drawerSceneCreator( scenes: Scenes ): SceneDestructor {
	const element = scenes.element;
	const escDestructor = escHandler( () => {
		scenes.show( 'room' );
		sendEvent( 'drawer-scene', 'leave', 'Esc' );
	} );

	createSvgElement( drawerSvgData, { id: 'drawer-inside', classes: 'plan' }, element );

	createBackButton( element, () => {
		scenes.show( 'room' );
		sendEvent( 'drawer-scene', 'leave', 'Button' );
	} );

	sendEvent( 'drawer-scene', 'enter' );

	return function destroy(): void {
		escDestructor();
	};
}
