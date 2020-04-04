import Illustrations, { IllustrationDestructor } from '../../utils/illustrations';

import createSvgElement from '../../utils/createsvgelement';
import createBackButton from '../../components/backbutton/createbackbutton';
import parallax from '../../utils/parallax';

import oscarSvgData from './images/oscar.svg';
import plantSvgData from './images/plant.svg';

import './style.css';
import escHandler from '../../utils/eschandler';

export default function creator( illustrations: Illustrations ): IllustrationDestructor {
	const element = illustrations.element;

	const oscar = createSvgElement( oscarSvgData, { id: 'oscar', classes: 'scene' }, element );
	const plant = createSvgElement( plantSvgData, { id: 'plant', classes: 'scene' }, element );

	const escDestructor = escHandler( () => illustrations.show( 'room' ) );
	createBackButton( element, () => ( illustrations.show( 'room' ) ) );

	const parallaxDestructor = parallax( {
		scene: element,
		items: [
			{ element: oscar, friction: 0.01 },
			{ element: plant, friction: 0.05 }
		]
	} );

	return function destroy(): void {
		parallaxDestructor();
		escDestructor();
	};
}
