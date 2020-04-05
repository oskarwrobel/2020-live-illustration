import { gsap } from 'gsap';
import Illustrations from '../../../utils/illustrations';
import createClipPath from '../../../utils/createclippath';

export default function oscarStatue( illustrations: Illustrations ): () => void {
	document.querySelector( '#oscar-small' ).addEventListener( 'click', () => {
		illustrations.show( 'oscar' );
	} );

	createClipPath( {
		source: '#blink-mask',
		targets: [ '#blink-group' ]
	} );

	const tl = gsap.timeline( { repeat: -1, delay: 3, repeatDelay: 5 } )
		.to( '#blnk', { y: -240, duration: .9, ease: 'none' } );

	return function oscarDestructor(): void {
		tl.kill();
	};
}
