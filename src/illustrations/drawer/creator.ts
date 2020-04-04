import Illustrations, { IllustrationDestructor } from '../../utils/illustrations';

import createSvgElement from '../../utils/createsvgelement';
import createBackButton from '../../components/backbutton/createbackbutton';
import escHandler from '../../utils/eschandler';
import sendEvent from '../../utils/sendevent';

import drawerSvgData from './images/drawer.svg';
import './style.css';

export default function creator( illustrations: Illustrations ): IllustrationDestructor {
	const element = illustrations.element;
	const escDestructor = escHandler( () => {
		illustrations.show( 'room' );
		sendEvent( 'drawer', 'leave', 'Esc' );
	} );

	sendEvent( 'drawer', 'enter' );

	createSvgElement( drawerSvgData, { id: 'drawer-inside', classes: 'scene' }, element );
	createBackButton( element, () => {
		illustrations.show( 'room' );
		sendEvent( 'drawer', 'leave', 'button' );
	} );

	return function destroy(): void {
		escDestructor();
	};
}
