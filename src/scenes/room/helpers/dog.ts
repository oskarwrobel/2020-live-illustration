import { gsap } from 'gsap';
import sendEvent from '../../../utils/sendevent';
import hoverHandler from '../../../utils/hoverhandler';

export default function dog(): () => void {
	const smileAnimation = gsap.to( '#smile', { attr: { d: 'M41.1,100.5 c0,0,22.9-6.5,22.9-19' }, paused: true } );
	let eventTimeoutId: any;

	hoverHandler( document.querySelector( '#leash' ), {
		enter: () => {
			smileAnimation.play();
			eventTimeoutId = setTimeout( () => {
				sendEvent( 'room-scene', 'Dog smile' );
			}, 500 );
		},
		leave: () => {
			smileAnimation.reverse();
			clearInterval( eventTimeoutId );
		}
	} );

	return function dogDestructor(): void {
		smileAnimation.kill();
	};
}
