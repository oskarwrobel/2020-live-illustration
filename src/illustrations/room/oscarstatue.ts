import Illustrations from '../../utils/illustrations';
import { SVG as svg } from '@svgdotjs/svg.js';

export default function oscarStatue( illustrations: Illustrations ): () => void {
	document.querySelector( '#oscar-small' ).addEventListener( 'click', () => {
		illustrations.show( 'oscar' );
	} );

	// Blink.
	const runner = svg( '#blink' )
		.dmove( 0, 160 )
		.animate( {
			delay: 1000,
			duration: 900
		} )
		.loop( Infinity, false, 5000 )
		.dmove( 0, -240 );

	return function oscarDestructor(): void {
		runner.finish();
	};
}
