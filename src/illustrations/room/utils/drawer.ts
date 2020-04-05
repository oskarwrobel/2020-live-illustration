import Illustrations from '../../../utils/illustrations';
import { gsap } from 'gsap';

const shift = 95;
const duration = 1;
const delay = .1;

const shadowFrom = '199.5,514 199.5,472.2 524.3,472.2 524.3,514';
const shadowTo = '199.5,543.9999877929688 199.5,472.2 524.2999877929688,472.2 524.2999877929688,543.9999877929688';

export default function drawer( illustrations: Illustrations ): void {
	const front = document.querySelector( '#front' );
	const shadow = document.querySelector( '#shadow' );
	const data = illustrations.current.data;

	let isTweening = false;

	if ( data.drawerIsOpened ) {
		front.setAttribute( 'transform', `translate( ${ shift }, 0 )` );
		shadow.setAttribute( 'points', shadowTo );

		isTweening = true;
		gsap.to( front, { x: '-=' + shift, duration, delay } );
		gsap.to( shadow, { attr: { points: shadowFrom }, duration, delay, onComplete: () => ( isTweening = false ) } );

		data.drawerIsOpened = false;
	}

	document.querySelector( '#drawer' ).addEventListener( 'click', () => {
		if ( isTweening ) {
			return;
		}

		isTweening = true;
		gsap.to( front, { x: shift, duration } );
		gsap.to( shadow, { attr: { points: shadowTo }, duration, onComplete } );
	} );

	function onComplete(): void {
		isTweening = false;
		data.drawerIsOpened = true;
		setTimeout( () => ( illustrations.show( 'drawer' ) ), delay * 1000 );
	}
}
