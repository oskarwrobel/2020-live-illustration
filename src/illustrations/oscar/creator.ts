import Illustrations, { IllustrationDestructor } from '../../utils/illustrations';

import createSvgElement from '../../utils/createsvgelement';
import parallax from '../../utils/parallax';

import oscarSvgData from './images/oscar.svg';
import plantSvgData from './images/plant.svg';

import './oscar.css';

export default function creator( illustrations: Illustrations ): IllustrationDestructor {
	const element = illustrations.element;

	const oscar = createSvgElement( oscarSvgData, { id: 'oscar', classes: 'scene' }, element );
	const plant = createSvgElement( plantSvgData, { id: 'plant', classes: 'scene' }, element );

	const parallaxDestructor = parallax( {
		scene: element,
		items: [
			{ element: oscar, friction: 0.01 },
			{ element: plant, friction: 0.05 }
		]
	} );

	oscar.addEventListener( 'click', () => illustrations.show( 'room' ) );

	return function destroy(): void {
		[ oscar, plant ].forEach( el => el.remove() );
		parallaxDestructor();
	};
}
