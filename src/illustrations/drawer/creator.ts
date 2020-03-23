import Illustrations, { IllustrationDestructor } from '../../utils/illustrations';

import createSvgElement from '../../utils/createsvgelement';

import drawerSvgData from './images/drawer.svg';

import './drawer.css';

export default function creator( illustrations: Illustrations ): IllustrationDestructor {
	const element = illustrations.element;

	const drawer = createSvgElement( drawerSvgData, { id: 'drawer-inside', classes: 'scene' }, element );

	drawer.addEventListener( 'click', () => illustrations.show( 'room' ) );

	return function destroy(): void {
		[ drawer ].forEach( el => el.remove() );
	};
}
