import { gsap } from 'gsap';
import Scenes from '../../../utils/scenes';
import createClipPath from '../../../utils/createclippath';

export default function postcard( scenes: Scenes ): () => void {
	document.querySelector( '#postcard-small' ).addEventListener( 'click', () => {
		scenes.show( 'postcard' );
	} );

	createClipPath( {
		source: '#postcard-blink-mask',
		targets: [ '#postcard-blink-group' ]
	} );

	const tl = gsap.timeline( { repeat: -1, delay: 2, repeatDelay: 4 } )
		.to( '#postcard-blink', { y: 160, duration: .8, ease: 'none' } );

	return function postcardDestructor(): void {
		tl.kill();
	};
}
