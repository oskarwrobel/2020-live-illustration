import Illustrations from '../../utils/illustrations';
import { SVG as svg } from '@svgdotjs/svg.js';

const shift = 95;
const shiftShadow = 30;
const duration = 800;
const delay = 100;

export default function toggleDrawer( illustrations: Illustrations ): void {
	const front = svg( '#front' );
	const shadow = svg( '#shadow' );
	const orgHeight = shadow.height();
	const data = illustrations.current.data;

	if ( data.drawerIsOpened ) {
		front.translate( shift, 0 );
		shadow.height( orgHeight + shiftShadow );

		setTimeout( () => {
			front.animate( duration ).translate( -shift, 0 );
			shadow.animate( duration ).height( orgHeight );
		}, delay );

		data.drawerIsOpened = false;
	}

	document.querySelector( '#drawer' ).addEventListener( 'click', () => {
		const x = front.transform().translateX;

		if ( x === shift ) {
			front.animate( duration ).translate( -shift, 0 );
			shadow.animate( duration ).height( orgHeight );
		} else if ( x === 0 ) {
			front.animate( duration ).translate( shift, 0 );

			shadow.animate( duration ).height( orgHeight + shiftShadow ).after( () => {
				data.drawerIsOpened = true;

				setTimeout( () => {
					illustrations.show( 'drawer' );
				}, delay );
			} );
		}
	} );
}
