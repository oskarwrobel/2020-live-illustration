import Scenes, { SceneDestructor } from '../../core/scenes';

import createSvgElement from '../../core/createsvgelement';
import createBackButton from '../../components/backbutton/createbackbutton';
import parallax from '../../core/parallax';
import escHandler from '../../core/eschandler';
import sendEvent from '../../core/sendevent';

import oscarSvgData from './images/oscar.svg';
import plantSvgData from './images/plant.svg';

import './style.css';

export default function oscarSceneCreator( scenes: Scenes ): SceneDestructor {
	const element = scenes.element;

	const oscar = createSvgElement( oscarSvgData, { id: 'oscar', classes: 'plan' }, element );
	const plant = createSvgElement( plantSvgData, { id: 'plant', classes: 'plan' }, element );

	sendEvent( 'oscar-scene', 'enter' );

	const escDestructor = escHandler( () => {
		scenes.show( 'room' );
		sendEvent( 'oscar-scene', 'leave', 'Esc' );
	} );

	createBackButton( element, () => {
		scenes.show( 'room' );
		sendEvent( 'oscar-scene', 'leave', 'Button' );
	} );

	const parallaxDestructor = parallax( {
		scene: element,
		items: [
			{ element: oscar, depth: 0.1 },
			{ element: plant, depth: 0.5 }
		]
	} );

	return function destroy(): void {
		parallaxDestructor();
		escDestructor();
	};
}
