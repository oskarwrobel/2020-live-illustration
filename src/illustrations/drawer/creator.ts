import Illustrations, { IllustrationDestructor } from '../../utils/illustrations';

import createSvgElement from '../../utils/createsvgelement';

import drawerSvgData from './images/drawer.svg';

import './style.css';
import createBackButton from '../../components/backbutton/createbackbutton';
import escHandler from '../../utils/eschandler';

export default function creator( illustrations: Illustrations ): IllustrationDestructor {
	const element = illustrations.element;
	const escDestructor = escHandler( () => illustrations.show( 'room' ) );

	createSvgElement( drawerSvgData, { id: 'drawer-inside', classes: 'scene' }, element );
	createBackButton( element, () => ( illustrations.show( 'room' ) ) );

	return function destroy(): void {
		escDestructor();
	};
}
