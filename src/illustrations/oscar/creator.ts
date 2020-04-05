import Illustrations, { IllustrationDestructor } from '../../utils/illustrations';

import createSvgElement from '../../utils/createsvgelement';
import createBackButton from '../../components/backbutton/createbackbutton';
import parallax from '../../utils/parallax';

import oscarSvgData from './images/oscar.svg';
import plantSvgData from './images/plant.svg';

import './style.css';
import escHandler from '../../utils/eschandler';
import sendEvent from '../../utils/sendevent';

export default function creator( illustrations: Illustrations ): IllustrationDestructor {
	const element = illustrations.element;

	const oscar = createSvgElement( oscarSvgData, { id: 'oscar', classes: 'scene' }, element );
	const plant = createSvgElement( plantSvgData, { id: 'plant', classes: 'scene' }, element );

	sendEvent( 'oscar', 'enter' );

	const escDestructor = escHandler( () => {
		illustrations.show( 'room' );
		sendEvent( 'oscar', 'leave', 'Esc' );
	} );

	createBackButton( element, () => {
		illustrations.show( 'room' );
		sendEvent( 'oscar', 'leave', 'button' );
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
